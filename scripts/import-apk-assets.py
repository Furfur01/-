"""Install recovered APK art into the HTML client; keep gameplay and saves intact.

Prerequisite: scripts/recover-apk.py extraction.
The mapping comes from GameFleetDefine / GameResearchDefine bytecode constants
and labelled frames in the original TFS files, not visual similarity.
"""
from pathlib import Path
import hashlib
import json
import shutil
import struct
from PIL import Image
from PIL import ImageOps
from apk_swf import parse
import apk_city

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'output/apk-icons'
WEB = ROOT / 'opendesign/mockups/galaxy-empire/assets/original'
TECH = {1:'Energy_Tech',2:'Laser_Tech',3:'Ion_Tech',4:'Hyperspace_Tech',5:'Plasma_Tech',6:'Combustion_Drive',7:'Impulse_Drive',8:'Hyperspace_Drive',9:'Espionage_Tech',10:'Computer_Tech',11:'Astrophysics_Tech',14:'Weapons_Tech',15:'Shielding_Tech',16:'Strength_Tech'}
UNITS = {1:'Light_Fighter',2:'Heavy_Fighter',3:'Cruiser',4:'Battleship',5:'Dreadnought',6:'Bomber',7:'Destroyer',9:'Cargo_Ship',10:'Large_Cargo_Ship',11:'Colony_Ship',12:'Recycler',13:'Probe',14:'Solar_Satellite',15:'Rocket_Launcher',16:'Light_Laser',17:'Heavy_Laser',18:'MK2_Cannon',19:'Ion_Cannon',20:'Plasma_Cannon',21:'Small_Shield_Dome',22:'Large_Shield_Dome',27:'Proton_Cannon'}
BUILDINGS = {1:'Metal_Mine',2:'Crystal_Mine',3:'Gas_Mine',4:'Solar_Plant',5:'Fusion_Reactor',6:'Metal_Storage',7:'Crystal_Storage',8:'Gas_Storage',9:'Robotics_Facility',10:'Shipyard',11:'Research_Lab',12:'Alliance_Depot',13:'Radar_Facility',14:'Nanite_Factory',15:'The_EU_X_Radar',16:'Wormhole_Generator',19:'Moon_Base'}
TECH_NAMES = ['能源科技','激光科技','离子科技','超空间科技','等离子科技','燃烧引擎','脉冲引擎','超空间引擎','间谍科技','计算机科技','天体物理科技']
NAMES = {'technology': {**dict(enumerate(TECH_NAMES,1)),14:'武器科技',15:'护盾科技',16:'装甲科技',17:'氪晶科技',18:'超高温科技',19:'反重力科技',20:'合金探测科技',21:'动力科技'},
 'fleet': dict(zip([1,2,3,4,5,6,7,9,10,11,12,13,14,23,24,25,26,28,29], ['轻型战机','重型战机','巡洋舰','战列舰','无畏舰','行星轰炸机','驱逐舰','轻型运输舰','重型运输舰','殖民舰','回收舰','探测器','太阳能卫星','拦截舰（暂译）','巨兽舰（暂译）','噬能截击者','钛能守卫者','毁灭舰（暂译）','收割者（暂译）'])),
 'defense': dict(zip([15,16,17,18,19,20,21,22,27],['火箭发射器','轻型激光炮','重型激光炮','磁轨炮','中子炮','等离子炮塔','小型防护盾','大型防护盾','质子炮'])),
 'building': dict(enumerate(['金属加工厂','晶体加工厂','气体提炼厂','太阳能电厂','核电厂','金属仓库','晶体仓库','气体储藏槽','机器人工厂','飞船基地','研究实验室','联盟太空站','预警雷达','纳米机器人工厂','月球雷达','虫洞发生器','月球飞船基地','月球机器人工厂','月球基地','氪晶研究中心','旗舰中心'],1))}

def strings(path):
    data = path.read_bytes()
    count, = struct.unpack_from('<H', data)
    pos, output = 2, []
    for _ in range(count):
        size, = struct.unpack_from('<H', data, pos)
        pos += 2
        output.append(data[pos:pos + size].decode('utf-8'))
        pos += size
    assert pos == len(data)
    return output

def scenes():
    """Recover the two City.tfs background layers; composition is a preview."""
    exports, shapes, _ = parse('City.tfs')
    result = []
    folder = WEB / 'scenes'
    folder.mkdir(exist_ok=True)
    for shape_id, key, name in [(485, 'home-ground', '主星基地地表'), (16, 'home-space', '主星星空')]:
        shape = shapes[shape_id]
        atlas = exports[shape['bitmap']]
        image = Image.open(SOURCE / 'atlases' / atlas).convert('RGBA').crop(shape['box'])
        image.save(folder / (key + '.png'))
        result.append({'name': name, 'asset': 'original/scenes/' + key + '.png',
            'source_ui': 'City.tfs', 'source_atlas': atlas, 'shape_id': shape_id,
            'box': shape['box'], 'width': image.width, 'height': image.height})
    ground = Image.open(folder / 'home-ground.png').convert('RGBA')
    sky = ImageOps.fit(Image.open(folder / 'home-space.png').convert('RGBA'), ground.size)
    sky.alpha_composite(ground)
    sky.save(folder / 'home-preview.png')
    result.insert(0, {'name': '主星场景 · 组合预览', 'asset': 'original/scenes/home-preview.png',
        'composition': '地表原图叠加等比裁切的星空；非原版场景精确位置还原',
        'width': sky.width, 'height': sky.height})
    for row in result:
        row['sha256'] = hashlib.sha256((WEB.parent / row['asset']).read_bytes()).hexdigest()
    return result

def main():
    apk_city.main()
    WEB.mkdir(parents=True, exist_ok=True)
    rows = json.loads((SOURCE / 'icons.json').read_text(encoding='utf-8'))['icons'] + json.loads((SOURCE / 'buildings.json').read_text(encoding='utf-8'))
    manifest = {'source':'yinhediguo.apk', 'version':'20260928-apk', 'technology':{}, 'units':{}, 'buildings':{}, 'anchors':{}, 'archive':[], 'audio':[]}
    for row in rows:
        category, number = row['category'], row['id']
        key, mapping = ('technology', TECH) if category == 'technology' else ('buildings', BUILDINGS) if category == 'building' else ('units', UNITS)
        game_id = mapping.get(number)
        target = Path(key) / (game_id + '.png') if game_id else Path('archive') / f'{category}_{number:02d}.png'
        destination = WEB / target
        destination.parent.mkdir(exist_ok=True)
        source = SOURCE / row['file']
        if category == 'building' and game_id:
            image = Image.open(source).convert('RGBA')
            side = max(image.size)
            canvas = Image.new('RGBA', (side, side))
            left, top = (side-image.width)//2, (side-image.height)//2
            canvas.paste(image, (left, top))
            canvas.save(destination)
            manifest['anchors'][game_id] = [0.5, round((top+image.height*0.82)/side, 5)]
        else:
            shutil.copyfile(source, destination)
        relative = 'original/' + target.as_posix()
        if game_id:
            manifest[key][game_id] = relative
        manifest['archive'].append({**row, 'name':NAMES[category][number], 'gameId':game_id, 'asset':relative, 'sha256':hashlib.sha256(destination.read_bytes()).hexdigest()})
    music_names = {'ME_Login':'登录主题','ME_Home_Planet':'母星','ME_Moon':'月球','ME_Battle':'战斗','ME_Fleet_Battle_Prep':'舰队集结','BGS_Solar_System_Loop':'太阳系','ME_Moon_Generated':'月球诞生','ME_Sting_Battle_Win':'战斗胜利','ME_Sting_Battle_Lose':'战斗失利','ME_Sting_Battle_Tie':'战斗平局','ME_Sting_Task_Complete':'任务完成','sound_button_click':'按钮点击','SE_Construct_Fleet':'建造舰船','SE_Fleet_Dispatch':'舰队出航','SE_Research_Tech_Update':'科技研究','SE_Research_Tech_Update_Cancel':'取消研究','SE_Building_Updating':'建筑升级','SE_Building_Update_Cancel':'取消升级','SE_Demote':'建筑降级','SE_Enter_Galaxy':'进入银河','SE_Enter_Solar_System':'进入太阳系','SE_Button_Appear':'界面弹出','SE_Transfer_Circle':'虫洞传送','SE_Induction_Circle_Scan':'月球扫描','SE_Radar_On':'开启雷达','SE_Radar_Off':'关闭雷达','SE_Rader_Facility_Warning':'雷达警报','SE_Receive_Package':'获得礼包','SE_Purchasing_Resources':'资源兑换','SE_Purchase_DarkMatter':'暗物质提示','krypton_decompose':'氪晶分解','krypton_start':'氪晶启动','krypton_strength_success':'氪晶强化成功'}
    (WEB / 'audio').mkdir(exist_ok=True)
    for source in sorted((SOURCE / 'original-assets/sound').iterdir()):
        if source.suffix not in ['.mp3', '.wav']:
            continue
        shutil.copyfile(source, WEB / 'audio' / source.name)
        manifest['audio'].append({'name':music_names.get(source.stem, source.stem), 'asset':'original/audio/'+source.name})
    manifest['scenes'] = scenes()
    city = json.loads((ROOT/'game/original-city.json').read_text('utf-8'))
    (WEB/'scenes/atlases').mkdir(exist_ok=True)
    for name in city['atlases']:
        shutil.copyfile(SOURCE/'atlases'/name, WEB/'scenes/atlases'/name)
    shutil.copyfile(ROOT/'game/original-city.json', WEB/'scenes/city.json')
    manifest['city'] = {'asset':'original/scenes/city.json','fps':city['fps'], 'widths':city['widths']}
    manifest['unmatched'] = {'technology':['Intergalactic_Network','Graviton_Tech'], 'units':['Death_Star','Guardian','Interceptor_Missile','Interplanetary_Missile'], 'buildings':['Command_Center','Terraformer','Missile_Silo']}
    destination = ROOT / 'game/original-assets.json'
    destination.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    shutil.copyfile(destination, WEB / 'manifest.json')
    text_path = SOURCE / 'original-assets/data2/text'
    localized = {stem: dict(zip(strings(text_path / (stem + '.idx')), strings(text_path / (stem + '.cn')))) for stem in ['building','menu','rank','contactus']}
    report_path = ROOT / 'research/apk'
    report_path.mkdir(exist_ok=True)
    (report_path/'zh-CN.json').write_text(json.dumps(localized,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'technology':len(manifest['technology']),'unit_art':len(manifest['units']),'building_art':len(manifest['buildings']),'archive':len(rows),'audio':len(manifest['audio'])},ensure_ascii=False))

if __name__ == '__main__':
    main()
