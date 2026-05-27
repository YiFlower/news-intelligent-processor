export type NewsCategory = '战略发展' | '技术创新' | '人事动态' | '合作签约' | '行业活动'

export interface NewsItem {
  id: string
  title: string
  summary: string
  content: string
  category: NewsCategory
  keywords: string[]
  source: string
  sourceUrl: string
  publishDate: string
  importance: number
  relatedIds: string[]
}

export interface HotTopic {
  id: string
  title: string
  newsIds: string[]
  summary: string
  keywords: string[]
}

export const NEWS_DATA: NewsItem[] = [
  {
    id: 'n001',
    title: '软通动力与华为云深化战略合作，共建智能制造生态',
    summary: '软通动力与华为云签署战略合作协议，双方将在云计算、人工智能、智能制造等领域展开全面合作，共同推动数字化转型。',
    content: '2024年4月，软通动力与华为云在北京正式签署深度战略合作协议。双方将在云计算基础设施、人工智能应用、智能制造解决方案等多个核心领域展开全面合作。软通动力将借助华为云的技术优势，为制造业客户提供更完整的数字化转型方案。此次合作标志着软通动力在智能制造赛道布局进一步深化，预计将覆盖超过500家制造业客户。',
    category: '合作签约',
    keywords: ['华为云', '战略合作', '智能制造', '数字化转型'],
    source: '软通动力官网',
    sourceUrl: 'https://www.isoftstone.com',
    publishDate: '2024-04-28',
    importance: 5,
    relatedIds: ['n005', 'n012']
  },
  {
    id: 'n002',
    title: '软通动力发布AI大模型应用平台iSoftStone AI，赋能千行百业',
    summary: '软通动力正式发布自主研发的AI大模型应用平台，支持多模型接入与私有化部署，面向政府、金融、医疗等行业提供定制化解决方案。',
    content: '软通动力在2024年技术创新大会上正式发布iSoftStone AI平台。该平台集成了主流大语言模型，支持企业私有化部署，并提供完整的AI应用开发工具链。平台已在政务、金融、医疗三大行业完成试点落地，累计服务企业超过200家。',
    category: '技术创新',
    keywords: ['AI大模型', 'iSoftStone AI', '私有化部署', '行业解决方案'],
    source: '36氪',
    sourceUrl: 'https://36kr.com',
    publishDate: '2024-04-25',
    importance: 5,
    relatedIds: ['n007', 'n015']
  },
  {
    id: 'n003',
    title: '软通动力荣获IDC中国数字化转型领军者奖项',
    summary: '在IDC中国年度颁奖典礼上，软通动力因在数字化转型领域的卓越贡献，获评2024年度数字化转型领军企业称号。',
    content: 'IDC中国近日发布2024年度数字化转型领域评估报告，软通动力凭借在云原生、AI应用和行业解决方案方面的突出表现，荣获数字化转型领军者奖项。这是软通动力连续第三年获此殊荣。',
    category: '行业活动',
    keywords: ['IDC', '数字化转型', '领军企业', '奖项'],
    source: 'IT之家',
    sourceUrl: 'https://ithome.com',
    publishDate: '2024-04-22',
    importance: 3,
    relatedIds: []
  },
  {
    id: 'n004',
    title: '软通动力任命刘天文为首席技术官，加速AI战略落地',
    summary: '软通动力宣布任命原百度研究院副院长刘天文担任公司首席技术官，主导公司AI技术战略规划与实施。',
    content: '软通动力今日宣布重大人事调整，任命刘天文博士为公司首席技术官。刘天文此前担任百度研究院副院长，在深度学习、自然语言处理领域具有深厚积累。新任CTO将统领软通动力技术委员会，推动AI大模型、云原生等核心技术方向的战略落地。',
    category: '人事动态',
    keywords: ['CTO', '人事任命', 'AI战略', '技术领导'],
    source: '雷锋网',
    sourceUrl: 'https://leiphone.com',
    publishDate: '2024-04-20',
    importance: 4,
    relatedIds: ['n002']
  },
  {
    id: 'n005',
    title: '软通动力与中国移动签署云网融合战略协议',
    summary: '软通动力与中国移动就云网融合业务达成战略合作，将共同为政企客户提供一体化的云计算和网络服务解决方案。',
    content: '软通动力与中国移动在京签署云网融合战略合作协议。双方将整合各自在云计算平台和通信网络方面的优势，为大型政企客户提供从网络接入到云端应用的一体化服务。合作首批项目已覆盖京津冀、长三角地区的20个省市政府数字化项目。',
    category: '合作签约',
    keywords: ['中国移动', '云网融合', '政企服务', '战略协议'],
    source: '通信世界',
    sourceUrl: 'https://cww.net.cn',
    publishDate: '2024-04-18',
    importance: 4,
    relatedIds: ['n001']
  },
  {
    id: 'n006',
    title: '软通动力Q1营收同比增长23%，AI业务贡献超30%',
    summary: '软通动力发布2024年一季度财报，总营收达58.7亿元，同比增长23%，其中AI相关业务收入同比增长超过180%。',
    content: '软通动力发布2024年第一季度业绩报告，期内实现营业收入58.7亿元，同比增长23.1%。AI大模型应用、智能制造和云计算三大业务板块表现亮眼，AI相关业务营收同比增幅高达180%，已占整体营收的30%以上。公司毛利率提升至22.3%，较上年同期提升1.8个百分点。',
    category: '战略发展',
    keywords: ['财报', '营收增长', 'AI业务', '季报'],
    source: '证券时报',
    sourceUrl: 'https://stcn.com',
    publishDate: '2024-04-15',
    importance: 5,
    relatedIds: ['n002', 'n009']
  },
  {
    id: 'n007',
    title: '软通动力发布行业首个面向政务的大模型安全合规框架',
    summary: '针对政务AI应用的合规难题，软通动力联合国家信息安全测评中心发布政务大模型安全合规框架，填补行业空白。',
    content: '软通动力与国家信息安全测评中心联合发布政务大模型安全合规框架。该框架涵盖数据安全、模型可信度、隐私保护三大维度，为政府部门采购和部署AI大模型提供评估标准。目前已有12个省级政务平台按照该框架完成合规评估。',
    category: '技术创新',
    keywords: ['政务AI', '安全合规', '大模型框架', '数据安全'],
    source: '人民邮电报',
    sourceUrl: 'https://people.com.cn',
    publishDate: '2024-04-12',
    importance: 4,
    relatedIds: ['n002', 'n010']
  },
  {
    id: 'n008',
    title: '软通动力雄安新区智慧城市项目二期正式开工',
    summary: '软通动力承建的雄安新区智慧城市建设项目二期工程正式启动，总投资约15亿元，将覆盖城市大脑、智慧交通等核心场景。',
    content: '雄安新区管委会与软通动力举行智慧城市建设项目二期开工仪式。本期项目总投资15.3亿元，建设周期18个月，将重点建设城市运营管理中心、智慧交通系统、智慧社区平台三大子系统，预计服务常住居民超过50万人。',
    category: '战略发展',
    keywords: ['雄安新区', '智慧城市', '城市大脑', '智慧交通'],
    source: '河北日报',
    sourceUrl: 'https://hebnews.cn',
    publishDate: '2024-04-10',
    importance: 5,
    relatedIds: ['n013']
  },
  {
    id: 'n009',
    title: '软通动力获评国家级专精特新重点小巨人企业',
    summary: '工信部公布2024年度专精特新重点小巨人企业名单，软通动力旗下软通智慧子公司成功入选，成为智慧城市领域标杆企业。',
    content: '工业和信息化部发布2024年度专精特新重点小巨人企业名单，软通动力旗下智慧城市专业子公司软通智慧成功入选。该评定主要考察企业在细分赛道的技术专业化程度、市场占有率及创新能力，软通智慧在城市操作系统领域处于国内领先地位。',
    category: '行业活动',
    keywords: ['专精特新', '小巨人', '软通智慧', '工信部'],
    source: '经济日报',
    sourceUrl: 'https://economydaily.cn',
    publishDate: '2024-04-08',
    importance: 3,
    relatedIds: ['n008']
  },
  {
    id: 'n010',
    title: '软通动力布局低空经济，成立无人机智慧调度中心',
    summary: '软通动力宣布进军低空经济赛道，在深圳成立低空智慧调度中心，将为城市无人机物流和应急服务提供数字化调度平台。',
    content: '软通动力在深圳正式成立低空经济智慧调度中心，这是公司在新兴赛道的重大战略布局。中心将建设覆盖大湾区的低空飞行数字化管理平台，支持无人机物流、城市空中交通、应急救援等多种应用场景，预计2025年平台日接入无人机超过10000架次。',
    category: '战略发展',
    keywords: ['低空经济', '无人机', '深圳', '数字化调度'],
    source: '深圳商报',
    sourceUrl: 'https://sznews.com',
    publishDate: '2024-04-05',
    importance: 4,
    relatedIds: []
  },
  {
    id: 'n011',
    title: '软通动力与阿里云联合发布工业大模型解决方案',
    summary: '软通动力携手阿里云推出面向工业领域的大模型解决方案，整合质检、预测性维护、供应链优化三大核心场景。',
    content: '软通动力与阿里云在杭州云栖大会上联合发布工业大模型解决方案工业智脑。方案深度整合阿里云通义千问大模型与软通动力的工业经验，覆盖产品质检、设备预测性维护、供应链智能优化三大场景，已在富士康、美的、吉利等头部制造企业完成落地验证。',
    category: '合作签约',
    keywords: ['阿里云', '工业大模型', '工业智脑', '智能制造'],
    source: '极客公园',
    sourceUrl: 'https://geekpark.net',
    publishDate: '2024-04-03',
    importance: 4,
    relatedIds: ['n001', 'n002']
  },
  {
    id: 'n012',
    title: '软通动力完成新一轮10亿元战略融资',
    summary: '软通动力宣布完成新一轮战略融资，融资规模达10亿元人民币，本轮由国家集成电路产业投资基金领投。',
    content: '软通动力宣布完成新一轮10亿元人民币战略融资，由国家集成电路产业投资基金领投，阿里云、深创投跟投。本轮融资将主要用于AI大模型研发、智慧城市平台建设及海外市场拓展三个方向。截至目前，软通动力累计融资总额已超过60亿元。',
    category: '战略发展',
    keywords: ['融资', '大基金', '战略投资', '资本'],
    source: '投中网',
    sourceUrl: 'https://chinaventure.com.cn',
    publishDate: '2024-04-01',
    importance: 5,
    relatedIds: ['n006']
  },
  {
    id: 'n013',
    title: '软通动力承接国家医疗数据要素流通平台建设项目',
    summary: '国家卫生健康委员会将医疗数据要素流通平台建设任务授予软通动力，该平台将整合全国三级医院的医疗数据资源。',
    content: '国家卫生健康委员会正式授权软通动力承建国家级医疗数据要素流通平台。平台将接入全国超过1500家三级医院，实现医疗影像、电子病历、基因组数据的安全共享与价值挖掘。平台采用隐私计算技术确保数据可用不可见，预计2025年6月完成一期建设。',
    category: '战略发展',
    keywords: ['医疗数据', '数据要素', '国家卫健委', '隐私计算'],
    source: '健康时报',
    sourceUrl: 'https://jksb.com.cn',
    publishDate: '2024-03-29',
    importance: 5,
    relatedIds: ['n007']
  },
  {
    id: 'n014',
    title: '软通动力2024春季校园招聘启动，计划招募5000名应届生',
    summary: '软通动力正式启动2024年春季校园招聘，计划在全国100所重点高校招募5000名应届毕业生，涵盖AI、云计算、大数据等技术方向。',
    content: '软通动力2024年春季校园招聘正式启动，计划在清华、北大、上交、浙大等100所重点高校举办招聘宣讲，全年招募应届毕业生5000人。岗位主要集中在AI算法、云原生开发、数据工程、产品经理四大方向。应届生起薪较上年提升15%，并提供专项AI培训计划。',
    category: '人事动态',
    keywords: ['校招', '应届生', '招聘', '人才战略'],
    source: '智联招聘',
    sourceUrl: 'https://zhaopin.com',
    publishDate: '2024-03-25',
    importance: 2,
    relatedIds: []
  },
  {
    id: 'n015',
    title: '软通动力出席世界互联网大会，发布数字中国建设白皮书',
    summary: '在乌镇召开的世界互联网大会上，软通动力作为重要参展企业发布了数字中国建设白皮书2024，展示最新数字化解决方案。',
    content: '2024年世界互联网大会在浙江乌镇举办，软通动力作为国内领军数字科技企业重磅亮相。会上发布数字中国建设白皮书2024，系统梳理了数字政府、数字经济、数字社会三大领域的建设路径与典型案例。软通动力展台吸引了超过3000名专业观众参观。',
    category: '行业活动',
    keywords: ['世界互联网大会', '白皮书', '数字中国', '乌镇'],
    source: '新华网',
    sourceUrl: 'https://xinhuanet.com',
    publishDate: '2024-03-20',
    importance: 3,
    relatedIds: ['n008', 'n013']
  },
  {
    id: 'n016',
    title: '软通动力智慧交通解决方案落地新加坡，开拓东南亚市场',
    summary: '软通动力与新加坡陆路交通管理局签署合作协议，将在新加坡部署智慧交通信号优化系统，这是公司东南亚业务的重要突破。',
    content: '软通动力在新加坡与陆路交通管理局正式签约，将为新加坡全岛3500个路口部署AI驱动的交通信号优化系统。该系统基于软通动力自研的交通AI大模型，可实时优化信号配时，预计降低主干道平均等待时间30%。此次合作是软通动力东南亚市场拓展的重要里程碑。',
    category: '合作签约',
    keywords: ['新加坡', '智慧交通', '东南亚', '国际化'],
    source: '经济参考报',
    sourceUrl: 'https://jjckb.com.cn',
    publishDate: '2024-03-18',
    importance: 4,
    relatedIds: ['n010']
  },
  {
    id: 'n017',
    title: '软通动力荣登财富中国科技50强榜单',
    summary: '财富杂志发布2024年中国科技50强榜单，软通动力以强劲的AI技术实力和持续增长的业绩首次跻身榜单前20位。',
    content: '财富杂志发布2024年度中国科技50强榜单，软通动力凭借在AI大模型、智慧城市和数字化转型领域的突出表现，首次跻身榜单第17位。评选委员会特别指出软通动力的AI商业化能力和与实体经济的深度融合模式，认为其代表了中国新一代科技服务企业的发展方向。',
    category: '行业活动',
    keywords: ['财富50强', '榜单', 'AI实力', '品牌'],
    source: '财富中文网',
    sourceUrl: 'https://fortunechina.com',
    publishDate: '2024-03-15',
    importance: 3,
    relatedIds: []
  },
  {
    id: 'n018',
    title: '软通动力与北京大学成立AI联合实验室',
    summary: '软通动力与北京大学人工智能研究院共同成立软通-北大AI联合实验室，聚焦大模型可解释性和行业应用研究。',
    content: '软通动力与北京大学人工智能研究院签署合作协议，正式成立软通-北大AI联合实验室。实验室将重点开展大语言模型可解释性、多模态AI、行业知识图谱三个方向的基础研究，双方共同投入资金超过1亿元，计划5年内发表高水平论文100篇以上，并完成30项核心专利申请。',
    category: '合作签约',
    keywords: ['北京大学', '联合实验室', 'AI研究', '产学研'],
    source: '中国科技网',
    sourceUrl: 'https://stdaily.com',
    publishDate: '2024-03-12',
    importance: 4,
    relatedIds: ['n002', 'n004']
  },
  {
    id: 'n019',
    title: '软通动力碳中和数字化平台助力30家央企实现绿色转型',
    summary: '软通动力发布企业碳中和数字化管理平台1.0版本，已为国家电网、中国石化等30家央企提供碳核算、碳资产管理和减排方案服务。',
    content: '软通动力正式发布企业碳中和数字化管理平台绿通1.0版本。平台集碳排放核算、碳资产登记、绿色供应链管理、CCER交易对接四大功能于一体，已成功服务国家电网、中国石化、中国铝业等30家大型央企。平台累计帮助客户识别减排机会超过1500万吨二氧化碳当量。',
    category: '技术创新',
    keywords: ['碳中和', '绿色转型', '央企', '碳资产'],
    source: '中国能源报',
    sourceUrl: 'https://people.com.cn',
    publishDate: '2024-03-08',
    importance: 3,
    relatedIds: []
  },
  {
    id: 'n020',
    title: '软通动力员工总数突破10万，成为国内最大IT服务商之一',
    summary: '软通动力宣布公司员工总数正式突破10万人，成为国内规模最大的综合性IT服务商之一，员工遍布全国50个城市。',
    content: '软通动力宣布公司全球员工总数突破10万人大关，在全国50个城市设有研发和交付中心，海外业务覆盖20个国家和地区。公司人均效能持续提升，人均产值较三年前提升40%。',
    category: '人事动态',
    keywords: ['员工规模', '10万人', '人才战略', '规模增长'],
    source: '软通动力官方',
    sourceUrl: 'https://isoftstone.com',
    publishDate: '2024-03-05',
    importance: 4,
    relatedIds: ['n014']
  },
  {
    id: 'n021',
    title: '软通动力推出面向中小企业的AI加SaaS产品矩阵',
    summary: '软通动力发布中小企业AI化升级套件，以低代码加大模型方式为中小企业提供可负担的AI工具，降低AI应用门槛。',
    content: '软通动力发布面向中小企业市场的AI加SaaS产品矩阵软通云智，包含AI客服、智能财务、供应链协同、数字营销四款SaaS产品。产品采用低代码配置方式，企业无需专业IT团队即可上线使用。基础版月费仅需999元起，目前已吸引超过5000家中小企业完成注册试用。',
    category: '技术创新',
    keywords: ['中小企业', 'SaaS', '低代码', 'AI工具'],
    source: '虎嗅网',
    sourceUrl: 'https://huxiu.com',
    publishDate: '2024-03-02',
    importance: 3,
    relatedIds: ['n002']
  },
  {
    id: 'n022',
    title: '软通动力入选国家数字经济试点示范企业',
    summary: '国家发展改革委公布数字经济试点示范企业名单，软通动力成功入选，将在数据要素、数字产业化等领域开展先行探索。',
    content: '国家发展改革委与工业和信息化部联合公布2024年数字经济试点示范企业名单，软通动力凭借在数据要素流通、数字产业生态构建方面的创新实践成功入选。入选后将获得政策支持和示范资金，重点推进医疗、政务、工业三大数据要素流通平台建设。',
    category: '战略发展',
    keywords: ['数字经济', '试点示范', '国家发改委', '数据要素'],
    source: '发改委官网',
    sourceUrl: 'https://ndrc.gov.cn',
    publishDate: '2024-02-28',
    importance: 4,
    relatedIds: ['n013']
  }
]

export const HOT_TOPICS: HotTopic[] = [
  {
    id: 't001',
    title: 'AI大模型战略全面提速',
    newsIds: ['n002', 'n004', 'n007', 'n018', 'n021'],
    summary: '软通动力持续加大AI大模型投入，从技术研发、人才引进、产学研合作到产品商业化，全方位构建AI竞争壁垒。期间发布iSoftStone AI平台，引进CTO，与北大建立联合实验室，面向中小企业推出AI SaaS矩阵。',
    keywords: ['AI大模型', '技术自研', '商业化', '产学研']
  },
  {
    id: 't002',
    title: '战略合作伙伴生态持续扩张',
    newsIds: ['n001', 'n005', 'n011', 'n016', 'n018'],
    summary: '软通动力密集签约，与华为云、中国移动、阿里云、北京大学、新加坡LTA建立战略合作。合作领域覆盖云计算、工业互联网、学术研究、海外市场，生态版图大幅扩张。',
    keywords: ['战略合作', '生态构建', '国际化', '伙伴关系']
  },
  {
    id: 't003',
    title: '智慧城市业务高速扩张',
    newsIds: ['n008', 'n013', 'n016', 'n022'],
    summary: '软通动力在智慧城市赛道持续深化布局，雄安新区项目二期开工，承接国家医疗数据平台，进军新加坡智慧交通市场，入选国家数字经济试点示范企业，业务规模和影响力持续提升。',
    keywords: ['智慧城市', '数字政府', '城市大脑', '国际化']
  }
]

export const CATEGORY_COLORS: Record<NewsCategory, string> = {
  '战略发展': 'tag-strategy',
  '技术创新': 'tag-tech',
  '人事动态': 'tag-hr',
  '合作签约': 'tag-partner',
  '行业活动': 'tag-event',
}

export const CATEGORY_STATS = [
  { name: '战略发展', count: 6, color: 'hsl(350, 82%, 42%)' },
  { name: '技术创新', count: 4, color: 'hsl(350, 82%, 52%)' },
  { name: '人事动态', count: 3, color: 'hsl(350, 75%, 62%)' },
  { name: '合作签约', count: 5, color: 'hsl(350, 70%, 70%)' },
  { name: '行业活动', count: 4, color: 'hsl(350, 65%, 78%)' },
]
