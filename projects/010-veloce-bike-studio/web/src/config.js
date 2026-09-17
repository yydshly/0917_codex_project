export const finishes = [
  { name: '曜石碳黑', en: 'UD STEALTH', color: '#20252d', accent: '#ff681f', metalness: .48, roughness: .26, clearcoat: .65 },
  { name: '竞速绯红', en: 'ROSSO CORSA', color: '#b91e29', accent: '#f0d2ce', metalness: .45, roughness: .21, clearcoat: .9 },
  { name: '天青珠光', en: 'CELESTE PEARL', color: '#65cbb9', accent: '#183e3c', metalness: .3, roughness: .28, clearcoat: .8 },
  { name: '拉丝钛银', en: 'BRUSHED TITANIUM', color: '#9ba4b3', accent: '#303b49', metalness: .92, roughness: .36, clearcoat: .2 },
  { name: '日耀橙', en: 'SOLAR PAPAYA', color: '#fa621e', accent: '#292c32', metalness: .22, roughness: .24, clearcoat: .85 },
];
export const wheels = [
  { name: 'SLR 全能轮组', depth: 50, mass: 1340, saving: 18.4, sidewall: '#aa8250', description: '均衡巡航 · 棕边胎' },
  { name: 'AERO 深框轮组', depth: 64, mass: 1465, saving: 24.8, sidewall: '#252a31', description: '平路高速 · 全黑胎' },
  { name: 'ALPINIST 爬坡轮组', depth: 36, mass: 1185, saving: 12.1, sidewall: '#ddd0ac', description: '轻量爬坡 · 奶油胎边' },
];
export const trims = [{name:'碳黑',color:'#242831'},{name:'干邑棕',color:'#9c6537'},{name:'粉笔白',color:'#d9dce1'}];
export const accessories = [
  {id:'frontLight',name:'前照明灯',mass:.12,description:'把横支架 · 白光照明'},
  {id:'rearLight',name:'后警示灯',mass:.04,description:'座管夹环 · 红光常亮'},
  {id:'phone',name:'手机与支架',mass:.30,description:'四角夹持 · 导航示意屏'},
  {id:'bell',name:'车把铃铛',mass:.05,description:'金属铃罩 · 可拨动响铃'},
  {id:'bottle',name:'水壶与水壶架',mass:.65,description:'550 mL · 支持取出查看'},
];
export const parts = [
  { id:'frame', name:'空气动力车架', en:'CHASSIS', description:'双三角车架与扁平管型。选择涂装可实时改变车架的颜色、金属感和清漆反射。', specs:[['示意材料','高模量碳纤维'],['车架尺寸','56 cm'],['车架参考重量','745 g'],['走线形式','一体式内走线']] },
  { id:'drive', name:'精密传动系统', en:'POWERTRAIN', description:'链条由交替内外链片、滚子与销轴构成，绕过 54T 牙盘、11–32T 可切换飞轮和两个 11T 导轮。支持慢动作、单齿步进和独立检视。', specs:[['牙盘','54T（40T 内盘仅展示）'],['曲柄长度','172.5 mm'],['链条节距','12.7 mm · 122 节'],['飞轮片数','12 片 · 11–32T'],['导轮','11T × 2'],['观察模式','正常 / 0.15× / 单齿步进']] },
  { id:'cockpit', name:'一体式操控组件', en:'COCKPIT', description:'弯把包含缠绕把带、端塞、手变胶套和刹车握杆，把立补有夹环与固定螺栓。前叉、前轮、手机支架和铃铛随车把同步转向。', specs:[['把宽','400 mm'],['把立','100 mm'],['转向范围','−30° 至 +30°'],['结构','一体式弯把']] },
  { id:'wheels', name:'轮组与碟刹', en:'WHEELSET', description:'三组轮框深度、胎边颜色与重量组合。轮圈、辐条、轮毂及碟刹均为独立三维部件。', specs:[['轮径','700C'],['轮框深度','36 / 50 / 64 mm'],['轮胎宽度','28 mm'],['碟片直径','160 mm']] },
  { id:'saddle', name:'坐垫与接触点', en:'CONTACT', description:'中央开孔坐垫、底壳、双轨座弓和螺栓夹座。坐垫及缠绕把带可切换黑、棕、白配色，分解时座管组件整体上移。', specs:[['坐垫宽度','143 mm（示意）'],['中央结构','贯通减压开孔'],['座弓','双轨与双螺栓夹座'],['配置','3 种接触点配色']] },
  { id:'phone',name:'手机与支架',en:'PHONE',description:'把横夹环连接前伸支臂、调角球头和四角夹爪；手机随车把转向。屏幕仅展示离线导航示意，不连接定位或地图服务。',specs:[['夹持','四角夹爪与背板'],['连接','把横夹环 / 支臂 / 球头'],['屏幕','静态导航示意'],['含手机估重','300 g']] },
  { id:'bell',name:'车把铃铛',en:'BELL',description:'金属半球铃罩、底座、把横夹环与拇指拨杆。点击响铃可查看拨杆动作并试听合成铃声。',specs:[['位置','把横内侧'],['铃罩','44 mm（示意）'],['动作','拨杆回弹'],['估重','50 g']] },
  { id:'bottle',name:'水壶与水壶架',en:'HYDRATION',description:'水壶架通过两个固定点安装在下管内侧，包含双侧抱臂、背板与托底。水壶有收腰、防滑环、旋盖和吸嘴，可沿壶架方向抽出查看。',specs:[['容量','550 mL（示意）'],['安装','下管双固定点'],['壶架','双侧抱臂 / 托底'],['满水估重','650 g（含壶架）']] },
  {id:'frontLight',name:'前照明灯',en:'HEADLIGHT',description:'把横夹环、支臂、灯体、三颗 LED 与透镜。灯随车把转向，支持开关；光束仅显示照明方向。',specs:[['安装','把横左侧独立夹环'],['照明','白光常亮 / 关闭'],['估重','120 g']]},
  {id:'rearLight',name:'后警示灯',en:'TAILLIGHT',description:'座管夹环固定红色尾灯，随座椅高度调节和部件分解移动。',specs:[['位置','座管后方'],['照明','红光常亮 / 关闭'],['估重','40 g']]},
  {id:'seatClamp',name:'座管快拆与升降',en:'SEATPOST',description:'车架上的固定夹环、贯穿拉杆、调节螺母和偏心快拆手柄。打开手柄后可沿座管轴线调节高度，再锁紧固定。',specs:[['行程','0–80 mm（示意）'],['联动','坐垫 / 座管 / 尾灯'],['锁紧','偏心快拆手柄']]},
  {id:'brakes',name:'刹车与滑行',en:'BRAKING',description:'前后刹独立控制，握杆与刹车片随力度移动。停止踩踏后车轮保持惯性，链条和曲柄停下。采用一维教学模型，未模拟抱死、侧滑或真实路面抓地。',specs:[['控制','前刹 / 后刹 0–100%'],['制动过程','握杆 → 刹车片 → 减速'],['滑行','车轮与传动分离'],['读数','模拟速度 / 本次制动距离']] },
];
export const initialConfig = {gear:5,frontLight:true,rearLight:true,lightMode:'off',seatHeight:0,seatClampOpen:false,finish:0,wheel:0,trim:0,cadence:78,steer:0,explode:0,playing:true,slow:false,isolate:false,step:0,flow:false,hotspots:true,turntable:false,view:'full',phone:true,bell:true,bottle:true,bottleOut:false,bellStrike:0,pedaling:true,frontBrake:0,rearBrake:0,brakeCutaway:false,rideReset:0};
// Educational estimates only: no live telemetry, CFD solver, or sensor input.
export function telemetry(config) {
  return {
    mass: 5.34 + wheels[config.wheel].mass / 1000 + accessories.reduce((sum,a)=>sum+(config[a.id]?a.mass:0),0), saving: wheels[config.wheel].saving};
}
