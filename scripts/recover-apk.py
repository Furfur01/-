"""Reproduce resource recovery by reading archives and bytecode, never executing it.

python scripts/recover-apk.py
Optional source: python scripts/recover-apk.py C:/path/to/yinhediguo.apk
Then: python scripts/import-apk-assets.py
Dependencies: Pillow and texture2ddecoder (also searched in output/apk-icons/_tools).
"""
from pathlib import Path
import argparse
import hashlib
import io
import json
import struct
import zipfile
import zlib
import apk_extract
import apk_swf

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/apk-icons'
REPORT = ROOT / 'research/apk'

class LuaChunk:
    """Parse the observed Lua 5.1 container, without interpreting instructions.

    This APK uses a reordered opcode table. Instruction 10 is its SETTABLE,
    as confirmed by the repeated enum declaration sequences in Define scripts.
    This is a constants/function structure export, not a source decompiler.
    """
    def __init__(self, data):
        assert data[:12] == b'\x1bLuaQ\x00\x01\x04\x04\x04\x08\x00'
        self.data, self.pos = data, 12

    def take(self, size):
        result = self.data[self.pos:self.pos+size]
        assert len(result) == size
        self.pos += size
        return result

    def u32(self):
        return struct.unpack('<I',self.take(4))[0]

    def string(self):
        size = self.u32()
        return self.take(size)[:-1].decode('utf-8',errors='replace') if size else ''

    def function(self):
        source = self.string()
        first, last = self.u32(), self.u32()
        nups, args, varargs, stack = self.take(4)
        instructions = [self.u32() for _ in range(self.u32())]
        constants = []
        for _ in range(self.u32()):
            kind = self.take(1)[0]
            if kind == 0: value = None
            elif kind == 1: value = bool(self.take(1)[0])
            elif kind == 3: value = struct.unpack('<d',self.take(8))[0]
            elif kind == 4: value = self.string()
            else: raise ValueError(f'Unsupported Lua constant type {kind}')
            constants.append(value)
        children = [self.function() for _ in range(self.u32())]
        self.take(self.u32()*4)
        local_vars = [{'name':self.string(),'start':self.u32(),'end':self.u32()} for _ in range(self.u32())]
        upvalues = [self.string() for _ in range(self.u32())]
        return {'source':source,'line_start':first,'line_end':last,'parameters':args,'stack':stack,'constants':constants,'instructions':instructions,'functions':children,'locals':local_vars,'upvalues':upvalues}

def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument('source',nargs='?',type=Path,default=ROOT/'research/apk/tap4fun.zip',
        help='Preserved tap4fun.zip (default), or the original APK to read without running it')
    args=cli.parse_args()
    REPORT.mkdir(parents=True,exist_ok=True)
    archive=apk_extract.open_asset_archive(args.source)
    prefix='tap4fun/galaxy_empire/AppOriginalData/Android/'
    raw=(OUT/'original-assets').resolve()
    for name in archive.namelist():
        if not name.startswith(prefix) or name.endswith('/'):
            continue
        path=(raw/name[len(prefix):]).resolve()
        if not path.is_relative_to(raw):
            raise ValueError('Resource path escapes the extraction directory')
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_bytes(archive.read(name))
    archive.close()
    apk_extract.main(args.source)
    apk_swf.main()
    buildings=apk_swf.make_icons('City_Explanation.tfs','building',{'main_city_res.png'})
    (OUT/'buildings.json').write_text(json.dumps(buildings,ensure_ascii=False,indent=2),encoding='utf-8')
    apk_swf.preview(buildings,'银河帝国 · 原版建筑（21 座）','建筑图标预览.png',4,275,240)
    structure=[]
    for path in sorted((raw/'data2').glob('*.tfs')):
        exports,shapes,sprites=apk_swf.parse(path.name)
        bitmaps=[v for v in exports.values() if v.endswith('.png')]
        structure.append({'file':path.name,'bitmaps':bitmaps,'missing_bitmaps':[v for v in bitmaps if not (OUT/'atlases'/v).exists()],'exports':{k:v for k,v in exports.items() if not v.endswith('.png')},'bitmap_shapes':shapes,'sprites':sprites})
    (REPORT/'ui-structure.json').write_text(json.dumps(structure,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    index=[{'file':v['file'],'bitmap_count':len(v['bitmaps']),'bitmap_shapes':len(v['bitmap_shapes']),'sprite_count':len(v['sprites']),'missing_bitmaps':v['missing_bitmaps']} for v in structure]
    (REPORT/'ui-index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2),encoding='utf-8')
    scripts, enums=[],{}
    bytecode=OUT/'lua-bytecode'
    analysis=OUT/'lua-analysis'
    bytecode.mkdir(exist_ok=True)
    analysis.mkdir(exist_ok=True)
    package=(raw/'data1.pak').read_bytes()
    for i in range(struct.unpack_from('<I',package,12)[0]):
        offset,size,_,flags=struct.unpack_from('<4I',package,16+i*16)
        chunk=zlib.decompress(package[offset+4:offset+size])
        expected,=struct.unpack_from('<I',package,offset)
        assert len(chunk)==expected
        reader=LuaChunk(chunk)
        data=reader.function()
        assert reader.pos==len(chunk)
        name=Path(data['source'].lstrip('@')).name
        (bytecode/(name+'c')).write_bytes(chunk)
        (analysis/(name+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
        scripts.append({'file':name,'source':data['source'],'functions':len(data['functions']),'bytes':len(chunk)})
        if name in ['GameFleetDefine.lua','GameResearchDefine.lua']:
            constants=data['constants']
            fields={}
            for word in data['instructions']:
                b,c=(word>>23)&511,(word>>14)&511
                if word&63==10 and b>=256 and c>=256:
                    fields[str(constants[b-256])]=constants[c-256]
            enums[name]=fields
    (REPORT/'lua-index.json').write_text(json.dumps(scripts,ensure_ascii=False,indent=2),encoding='utf-8')
    (REPORT/'enum-definitions.json').write_text(json.dumps(enums,ensure_ascii=False,indent=2),encoding='utf-8')
    summary={'source':args.source.name,'source_kind':'apk' if args.source.suffix.lower()=='.apk' else 'resource-pack','sha256':hashlib.sha256(args.source.read_bytes()).hexdigest(),'textures':len(list((OUT/'atlases').glob('*.png'))),'tfs_files':len(structure),'lua_chunks':len(scripts),'audio_files':len(list((raw/'sound').iterdir())),'missing_bitmap_references':sorted({name for v in structure for name in v['missing_bitmaps']})}
    (REPORT/'recovery.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f"Recovered {len(structure)} TFS structures and {len(scripts)} Lua chunks")

if __name__=='__main__':
    main()
