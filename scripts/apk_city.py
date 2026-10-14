"""Read City.tfs display lists into a small, data-only animation scene.

Only bitmap placement, transforms, opacity and frame timing are imported.
No ActionScript or Lua is executed by either client.
"""
from pathlib import Path
import json
import struct
import zlib
from apk_swf import Bits, tags, parse

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'output/apk-icons'
IDENTITY = [1, 0, 0, 1, 0, 0]

def multiply(a, b):
    return [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1],
            a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3],
            a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]]

class City:
    def __init__(self, name='City.tfs'):
        raw = (SOURCE / 'original-assets/data2' / name).read_bytes()
        data = zlib.decompress(raw[8:])
        bits = Bits(data)
        self.rect = bits.rect()
        start = bits.pos // 8
        self.fps = struct.unpack_from('<H', data, start)[0] / 256
        self.exports, _, self.labels = parse(name)
        self.shapes, self.sprites, self.texts, self.bounds, self.unsupported = {}, {}, {}, {}, set()
        self.root = self.timeline(data, start + 4)

    def placement(self, body, tag, display, frame):
        flags = body[0]
        extra = body[1] if tag == 70 else 0
        pos = 2 if tag == 70 else 1
        depth, = struct.unpack_from('<H', body, pos)
        pos += 2
        if extra & 8 or ((extra & 16) and flags & 2):
            pos = body.index(0, pos) + 1
        item = dict(display.get(depth, {})) if flags & 1 else {}
        if flags & 2:
            character, = struct.unpack_from('<H', body, pos)
            pos += 2
            if item.get('id') != character or not flags & 1:
                item['start'] = frame
            item['id'] = character
        if flags & 4:
            bits = Bits(body, pos)
            matrix = list(bits.matrix())
            matrix[4] /= 20
            matrix[5] /= 20
            item['m'] = matrix
            pos = bits.pos // 8
        if flags & 8:
            bits = Bits(body, pos)
            add, mult, size = bits.u(1), bits.u(1), bits.u(4)
            multiplier = [bits.s(size)/256 for _ in range(4)] if mult else [1]*4
            additive = [bits.s(size) for _ in range(4)] if add else [0]*4
            item['alpha'] = max(0, min(1, multiplier[3]+additive[3]/255))
            bits.align()
            pos = bits.pos // 8
        if flags & 16:
            pos += 2
        if flags & 32:
            end = body.index(0, pos)
            item['name'] = body[pos:end].decode()
            pos = end + 1
        if flags & 64:
            item['clip_depth'], = struct.unpack_from('<H', body, pos)
            pos += 2
        if extra & 1:
            # Filters are retained in the original TFS; skip their variable data.
            # Bitmap timelines do not need them for motion or texture selection.
            self.unsupported.add('filter_effects')
        elif extra & 2:
            item['blend'] = body[pos]
        item.setdefault('m', IDENTITY)
        item.setdefault('alpha', 1)
        item.setdefault('start', frame)
        item['depth'] = depth
        if 'id' in item:
            display[depth] = item

    def timeline(self, data, offset=0):
        display, frames = {}, []
        for tag, body in tags(data, offset):
            if tag in [26, 70]:
                self.placement(body, tag, display, len(frames))
            elif tag == 28:
                display.pop(struct.unpack_from('<H', body)[0], None)
            elif tag == 1:
                frames.append([dict(display[k]) for k in sorted(display)])
            elif tag == 39:
                character, count = struct.unpack_from('<HH', body)
                self.sprites[character] = self.timeline(body, 4)
                assert len(self.sprites[character]) == count
            elif tag == 37:
                character, = struct.unpack_from('<H', body)
                bits = Bits(body,2)
                rect = bits.rect()
                flags = [bits.u(1) for _ in range(16)]
                pos = bits.pos // 8
                if flags[7]:
                    pos += 2
                if flags[8]:
                    pos = body.index(0,pos)+1
                size = 20
                if flags[7]:
                    size = struct.unpack_from('<H',body,pos)[0]/20
                    pos += 2
                color = [255,255,255,255]
                if flags[5]:
                    color = list(body[pos:pos+4])
                    pos += 4
                if flags[6]:
                    pos += 2
                align = 0
                if flags[10]:
                    align = body[pos]
                    pos += 9
                end=body.index(0,pos)
                variable=body[pos:end].decode('utf-8',errors='replace')
                pos=end+1
                text=body[pos:body.index(0,pos)].decode('utf-8',errors='replace') if flags[0] else ''
                self.texts[character]={'rect':[rect[0]/20,rect[2]/20,(rect[1]-rect[0])/20,(rect[3]-rect[2])/20],
                    'size':size,'color':color,'align':align,'text':text,'variable':variable,'html':bool(flags[14])}
            elif tag in [2, 22, 32]:
                character, = struct.unpack_from('<H', body)
                bits = Bits(body, 2)
                rect = bits.rect()
                pos = bits.pos // 8
                self.bounds[character] = [rect[0]/20,rect[2]/20,(rect[1]-rect[0])/20,(rect[3]-rect[2])/20]
                if body[pos] != 1 or body[pos+1] not in [64,65,66,67]:
                    continue
                bitmap, = struct.unpack_from('<H', body, pos+2)
                a,b,c,d,x,y = Bits(body,pos+4).matrix()
                if b or c or a <= 0 or d <= 0:
                    continue
                box = [round((rect[0]-x)/a), round((rect[2]-y)/d),
                       round((rect[1]-x)/a), round((rect[3]-y)/d)]
                self.shapes[character] = {'atlas': self.exports[bitmap], 'box': box,
                    'rect': [rect[0]/20,rect[2]/20,(rect[1]-rect[0])/20,(rect[3]-rect[2])/20]}
        return frames or [[]]

    def named(self, character):
        return {p['name']: p for p in self.sprites[character][0] if 'name' in p}

    def leaves(self, character, matrix=None, frame=0):
        matrix = matrix or IDENTITY
        if character in self.shapes:
            yield character, matrix
        elif character in self.sprites:
            for p in self.sprites[character][frame % len(self.sprites[character])]:
                yield from self.leaves(p['id'], multiply(matrix,p['m']))

    def export(self, buildings):
        city = self.named(1389)
        # Crop origin is the actual ground image position in the original stage.
        ground_matrix = self.sprites[800][0][1]['m']
        assert self.sprites[800][0][1]['id'] == 486
        origin = ground_matrix[4:]
        scale = 1600/1852
        normalize = [scale,0,0,scale,-origin[0]*scale, -origin[1]*scale]
        roots = [p for p in self.root[0] if p.get('name') in ['space_bg3','space_bg4']]
        roots += [city['bg'], city['star_gate']]
        foreground = [p for p in self.root[0] if p.get('name') == 'cityShip']
        reached = set()
        def visit(character):
            if character in reached:
                return
            reached.add(character)
            for frame in self.sprites.get(character, []):
                for item in frame:
                    visit(item['id'])
        for p in roots+foreground:
            visit(p['id'])
        shapes = {k:v for k,v in self.shapes.items() if k in reached and (SOURCE/'atlases'/v['atlas']).exists()}
        # Keep the original stage ground in this renderer, not a duplicate CSS layer.
        sprite_data = {}
        for k in reached:
            if k not in self.sprites:
                continue
            sprite_data[k] = [[{a:p[a] for a in ['id','m','alpha','start','blend'] if a in p}
                for p in frame] for frame in self.sprites[k]]
        positions, widths, sources = {}, {}, {}
        building_by_id = {b['id']:b for b in buildings}
        mapping = {1:'Metal_Mine',2:'Crystal_Mine',3:'Gas_Mine',4:'Solar_Plant',5:'Fusion_Reactor',
            6:'Metal_Storage',7:'Crystal_Storage',8:'Gas_Storage',9:'Robotics_Facility',10:'Shipyard',
            11:'Research_Lab',12:'Alliance_Depot',13:'Radar_Facility',14:'Nanite_Factory'}
        for number,key in mapping.items():
            root = city['building_sprite_'+str(number)]
            frame = self.sprites[1377][number-1]
            p = next(p for p in frame if p.get('name')=='sprite')
            animation = self.named(p['id'])['anim']
            expected = building_by_id[number]['crop_box']
            matches = [(s,m) for s,m in self.leaves(animation['id'],multiply(multiply(root['m'],p['m']),animation['m']))
                if self.shapes[s]['atlas']=='main_city_res.png' and self.shapes[s]['box']==expected]
            if not matches and key == 'Radar_Facility':
                # City.tfs starts the radar at another rotation than its info icon.
                matches = [(s,m) for s,m in self.leaves(animation['id'],multiply(multiply(root['m'],p['m']),animation['m']))
                    if self.shapes[s]['atlas']=='main_city_res.png'][:1]
            assert len(matches)==1,(key,len(matches))
            shape,matrix = matches[0]
            matrix = multiply(normalize,matrix)
            x,y,w,h = self.shapes[shape]['rect']
            assert matrix[1]==0 and matrix[2]==0
            positions[key]=[round(matrix[4]+(x+w/2)*matrix[0],2),round(matrix[5]+(y+h*.82)*matrix[3],2)]
            widths[key]=round(max(expected[2]-expected[0],expected[3]-expected[1])*matrix[0],2)
            sources[key]={'instance':root['name'],'shape_id':shape,'matrix':matrix}
        # These three local facilities have no matching original City.tfs sprite.
        positions.update(Command_Center=[990,350],Terraformer=[920,560],Missile_Silo=[675,650])
        widths.update(Command_Center=140,Terraformer=145,Missile_Silo=130)
        return {'source':'City.tfs','fps':self.fps,'size':[1600,1120],'transform':normalize,
            'roots':roots,'foreground':foreground,'shapes':shapes,'sprites':sprite_data,
            'atlases':sorted({v['atlas'] for v in shapes.values()}),
            'defaults':positions,'widths':widths,'placement_sources':sources,
            'limitations':sorted(self.unsupported | {'ActionScript not executed','RGB color filters not replayed'})}

def main():
    city = City()
    buildings=json.loads((SOURCE/'buildings.json').read_text('utf-8'))
    scene=city.export(buildings)
    path=ROOT/'game/original-city.json'
    path.write_text(json.dumps(scene,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    (ROOT/'game/original-layout.json').write_text(json.dumps({k:scene[k] for k in ['source','size','defaults','widths','placement_sources']},ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'fps':scene['fps'],'shapes':len(scene['shapes']),'sprites':len(scene['sprites']),
        'atlases':scene['atlases'],'defaults':scene['defaults'],'bytes':path.stat().st_size},ensure_ascii=False))

if __name__=='__main__':
    main()
