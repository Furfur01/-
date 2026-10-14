"""Read both APK Lua architectures and every resource PAK without executing bytecode."""
import collections
import hashlib
import importlib.util
import json
from pathlib import Path
import sqlite3
import struct
import zipfile
import zlib

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('recover', ROOT/'scripts/recover-apk.py')
recover = importlib.util.module_from_spec(spec)
spec.loader.exec_module(recover)

class LuaReader(recover.LuaChunk):
    def __init__(self, data):
        assert data[:8] == b'\x1bLuaQ\x00\x01\x04'
        assert data[8] in (4, 8) and data[9:12] == b'\x04\x08\x00'
        self.data, self.pos, self.string_size = data, 12, data[8]

    def string(self):
        size = int.from_bytes(self.take(self.string_size), 'little')
        return self.take(size)[:-1].decode('utf8') if size else ''

fields = {'armour','shield','attack','speed','capacity','fuel_usage','fatal_damage_list','damage_rate','bonus_damage_rate'}
report = {'method':'Offline static parsing; no APK or bytecode execution, no server request.', 'packages':[], 'fieldReaders':[], 'literalFieldAssignments':[], 'requestEvidence':[]}
archive = ROOT/'research/apk/tap4fun.zip'
report['resourceSha256'] = hashlib.sha256(archive.read_bytes()).hexdigest()
with zipfile.ZipFile(archive) as z:
    names = [n for n in z.namelist() if not n.endswith('/')]
    report['resourceFiles'] = len(names)
    report['extensions'] = dict(collections.Counter(Path(n).suffix for n in names))
    for name in names:
        if not name.endswith('.pak'):
            continue
        data = z.read(name)
        count, = struct.unpack_from('<I', data, 12)
        package = {'path':name,'entries':count,'luaChunks':0,'otherHeaders':[]}
        for i in range(count):
            offset, size, _, flags = struct.unpack_from('<4I', data, 16+i*16)
            chunk = zlib.decompress(data[offset+4:offset+size])
            assert len(chunk) == struct.unpack_from('<I', data, offset)[0]
            if not chunk.startswith(b'\x1bLua'):
                package['otherHeaders'].append(chunk[:16].hex())
                continue
            reader = LuaReader(chunk)
            parsed = reader.function()
            assert reader.pos == len(chunk)
            package['luaChunks'] += 1
            def walk(p):
                constants = p['constants']
                evidence = {'package':Path(name).name,'source':parsed['source'],'lines':[p['line_start'],p['line_end']]}
                if fields.intersection(c for c in constants if isinstance(c,str)):
                    report['fieldReaders'].append({**evidence,'fields':sorted(fields.intersection(c for c in constants if isinstance(c,str)))})
                if 'fleets/' in constants and 'SendMsg' in constants:
                    report['requestEvidence'].append({**evidence,'constants':constants,'callbackLocals':[x['locals'] for x in p['functions']]})
                for word in p['instructions']:
                    b,c=(word>>23)&511,(word>>14)&511
                    if word&63 == 10 and b>=256 and c>=256 and constants[b-256] in fields:
                        report['literalFieldAssignments'].append({**evidence,'field':constants[b-256],'value':constants[c-256]})
                for child in p['functions']:
                    walk(child)
            walk(parsed)
        report['packages'].append(package)
db = sqlite3.connect((ROOT/'output/apk-inspection/game003.sqlite').as_uri()+'?mode=ro',uri=True)
report['databaseTables'] = [r[0] for r in db.execute('select name from sqlite_master where type="table"')]
db.close()
assert sum(p['luaChunks'] for p in report['packages']) == 338
assert len(report['packages']) == 19
assert {p['package'] for p in report['requestEvidence']} == {'data1.pak','data1_64.pak'}
assert not report['literalFieldAssignments'], 'Review numeric field assignments before making an absence claim'
report['conclusion'] = 'Ship identifiers, localized descriptions and stat field readers are present. Both Lua builds request fleets/<fleet_id> and pass response content to UpdatePanel. No constant-to-constant SETTABLE assignments for the nine stat/counter fields were found; no standalone numeric ship table was identified in the inspected resources. Native code was not fully decompiled; this is not proof that every possible embedded numeric value is absent.'
out = ROOT/'research/apk/ship-audit/deep-audit.json'
out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'resources':len(names),'packages':len(report['packages']),'luaChunks':338,'statReaders':len(report['fieldReaders']),'literalAssignments':len(report['literalFieldAssignments']),'output':str(out)},ensure_ascii=True))
