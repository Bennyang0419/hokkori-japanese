// ====================================================
// ほっこり日語 — 真實學習內容資料庫
// N5 完整文法、單字、漢字
// ====================================================
 
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
 
export interface GrammarItem {
  id: string
  pattern: string
  meaning: string
  structure: string
  examples: { jp: string; zh: string }[]
  notes: string
  commonErrors?: string
}
 
export interface VocabItem {
  id: string
  word: string
  reading: string
  meaning: string
  pos: string // part of speech
  examples: { jp: string; zh: string }[]
  tip?: string
}
 
export interface KanjiItem {
  id: string
  char: string
  on: string[]
  kun: string[]
  meaning: string
  strokes: number
  words: { word: string; reading: string; meaning: string }[]
}
 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// N5 文法（30 個核心文法）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const N5_GRAMMAR: GrammarItem[] = [
  {
    id: 'n5-g1',
    pattern: '〜は〜です',
    meaning: '⋯是⋯（基本判斷句）',
    structure: '名詞 ＋ は ＋ 名詞 ＋ です',
    examples: [
      { jp: '私は学生です。', zh: '我是學生。' },
      { jp: '田中さんは先生です。', zh: '田中先生是老師。' },
      { jp: 'これはペンです。', zh: '這是鋼筆。' },
    ],
    notes: '「は」是主題助詞，標示句子的主題。否定形為「〜ではありません」或口語的「〜じゃないです」。',
    commonErrors: '「は」發音為「wa」，不是「ha」。',
  },
  {
    id: 'n5-g2',
    pattern: '〜が あります／います',
    meaning: '有⋯（存在表現）',
    structure: '場所 ＋ に ＋ もの／ひと ＋ が ＋ あります／います',
    examples: [
      { jp: '机の上に本があります。', zh: '桌子上有書。' },
      { jp: '公園に子供がいます。', zh: '公園裡有小孩。' },
      { jp: '冷蔵庫にビールがありますか。', zh: '冰箱裡有啤酒嗎？' },
    ],
    notes: '「あります」用於無生命的事物；「います」用於有生命的人或動物。',
    commonErrors: '注意：「あります」和「います」不可混用！人和動物一定用「います」。',
  },
  {
    id: 'n5-g3',
    pattern: '〜ている',
    meaning: '正在做⋯／狀態持續中',
    structure: '動詞て形 ＋ いる',
    examples: [
      { jp: '今、ご飯を食べています。', zh: '現在正在吃飯。' },
      { jp: '電気がついています。', zh: '燈開著（狀態）。' },
      { jp: '彼女は日本語を勉強しています。', zh: '她正在學日文。' },
    ],
    notes: '「〜ている」有兩個用法：①動作進行中 ②動作結果的狀態持續。',
    commonErrors: '「電気がついています」是狀態，不是「正在開燈」的動作。',
  },
  {
    id: 'n5-g4',
    pattern: '〜たい',
    meaning: '想要做⋯（第一人稱願望）',
    structure: '動詞ます形（去ます） ＋ たい',
    examples: [
      { jp: '日本へ行きたいです。', zh: '我想去日本。' },
      { jp: '水が飲みたい。', zh: '我想喝水。' },
      { jp: '早く寝たいです。', zh: '我想早點睡。' },
    ],
    notes: '「たい」只用於第一人稱（說話者自己）。說第三人稱時要用「〜たがっています」。',
    commonErrors: '❌ 彼は日本へ行きたいです。→ ✅ 彼は日本へ行きたがっています。',
  },
  {
    id: 'n5-g5',
    pattern: '〜てください',
    meaning: '請做⋯（請求）',
    structure: '動詞て形 ＋ ください',
    examples: [
      { jp: 'ここに名前を書いてください。', zh: '請在這裡寫上名字。' },
      { jp: 'もう一度言ってください。', zh: '請再說一次。' },
      { jp: '静かにしてください。', zh: '請安靜。' },
    ],
    notes: '比「〜なさい」更有禮貌的請求表現。禁止則用「〜ないでください」。',
    commonErrors: '',
  },
  {
    id: 'n5-g6',
    pattern: '〜ないでください',
    meaning: '請不要做⋯（禁止請求）',
    structure: '動詞ない形（去い） ＋ ないでください',
    examples: [
      { jp: 'ここで写真を撮らないでください。', zh: '請不要在這裡拍照。' },
      { jp: '遅刻しないでください。', zh: '請不要遲到。' },
    ],
    notes: '「〜てはいけません」語氣更強，是「禁止」；「〜ないでください」是禮貌的請求。',
    commonErrors: '',
  },
  {
    id: 'n5-g7',
    pattern: '〜ましょう／〜ませんか',
    meaning: '一起做⋯吧／要不要一起做⋯',
    structure: '動詞ます形（去ます） ＋ ましょう／ませんか',
    examples: [
      { jp: '一緒に食べましょう。', zh: '一起吃吧。' },
      { jp: '映画を見ませんか。', zh: '要不要去看電影？' },
      { jp: '少し休みましょうか。', zh: '稍微休息一下吧？' },
    ],
    notes: '「ましょう」是主動提議；「ませんか」是邀請對方，帶有詢問對方意願的語氣。',
    commonErrors: '',
  },
  {
    id: 'n5-g8',
    pattern: '〜から',
    meaning: '因為⋯（原因・理由）',
    structure: '文 ＋ から、文',
    examples: [
      { jp: '疲れたから、休みます。', zh: '因為累了，所以要休息。' },
      { jp: '雨が降っているから、傘を持っていきます。', zh: '因為在下雨，所以帶傘去。' },
    ],
    notes: '「から」放在原因句的後面。也可以放在句尾表示說明理由。',
    commonErrors: '注意：「から」前面用普通形（非敬語）更自然。',
  },
  {
    id: 'n5-g9',
    pattern: '〜が好きです／嫌いです',
    meaning: '喜歡⋯／討厭⋯',
    structure: 'もの・こと ＋ が ＋ 好き／嫌い ＋ です',
    examples: [
      { jp: '私はラーメンが好きです。', zh: '我喜歡拉麵。' },
      { jp: '彼は野菜が嫌いです。', zh: '他討厭蔬菜。' },
      { jp: '音楽が大好きです。', zh: '我非常喜歡音樂。' },
    ],
    notes: '「好き」「嫌い」是形容動詞（な形容詞）。程度可加「大（だい）」，如「大好き」「大嫌い」。',
    commonErrors: '❌ 私は音楽を好きです。→ ✅ 私は音楽が好きです。（用が，不用を）',
  },
  {
    id: 'n5-g10',
    pattern: '〜が上手です／下手です',
    meaning: '擅長⋯／不擅長⋯',
    structure: 'もの・こと ＋ が ＋ 上手／下手 ＋ です',
    examples: [
      { jp: '田中さんは料理が上手です。', zh: '田中先生很擅長做菜。' },
      { jp: '私は歌が下手です。', zh: '我不擅長唱歌。' },
    ],
    notes: '說自己擅長某事時，直接說「私は〜が上手です」顯得不謙虛，通常說「〜が得意です」。',
    commonErrors: '',
  },
  {
    id: 'n5-g11',
    pattern: '〜も',
    meaning: '⋯也（添加・並列）',
    structure: '名詞 ＋ も',
    examples: [
      { jp: '私も学生です。', zh: '我也是學生。' },
      { jp: 'コーヒーも紅茶も飲みます。', zh: '咖啡和紅茶都喝。' },
    ],
    notes: '「も」替換「は」「が」「を」等助詞，表示「也」。兩個以上時用「〜も〜も」。',
    commonErrors: '',
  },
  {
    id: 'n5-g12',
    pattern: '〜の',
    meaning: '的（所有・修飾）',
    structure: '名詞A ＋ の ＋ 名詞B',
    examples: [
      { jp: '私の本です。', zh: '是我的書。' },
      { jp: '日本語の勉強', zh: '日文的學習' },
      { jp: '東京の電車', zh: '東京的電車' },
    ],
    notes: '「の」有多種用法：①所有「私の」②修飾「日本語の」③代替名詞「赤いの」。',
    commonErrors: '',
  },
  {
    id: 'n5-g13',
    pattern: '〜に行きます',
    meaning: '去做⋯（目的）',
    structure: '動詞ます形（去ます）＋ に ＋ 行きます／来ます／帰ります',
    examples: [
      { jp: '買い物に行きます。', zh: '去購物。' },
      { jp: '映画を見に来ました。', zh: '來看電影了。' },
      { jp: '食べに行きませんか。', zh: '要不要去吃？' },
    ],
    notes: '表示移動的目的。動詞一定用「ます形去ます」的形態，名詞則直接加に。',
    commonErrors: '',
  },
  {
    id: 'n5-g14',
    pattern: '〜で（場所）',
    meaning: '在⋯（動作發生的場所）',
    structure: '場所 ＋ で ＋ 動作',
    examples: [
      { jp: '図書館で勉強します。', zh: '在圖書館讀書。' },
      { jp: '公園で遊びました。', zh: '在公園玩了。' },
      { jp: 'レストランで食べましょう。', zh: '在餐廳吃吧。' },
    ],
    notes: '「で」表示動作發生的場所。存在（あります／います）則用「に」，注意區別！',
    commonErrors: '❌ 図書館に勉強します。→ ✅ 図書館で勉強します。',
  },
  {
    id: 'n5-g15',
    pattern: '〜や〜など',
    meaning: '⋯和⋯等（列舉）',
    structure: '名詞A ＋ や ＋ 名詞B ＋ など',
    examples: [
      { jp: 'りんごやみかんなどを買いました。', zh: '買了蘋果和橘子等。' },
      { jp: 'テレビやゲームなどが好きです。', zh: '喜歡電視和遊戲等。' },
    ],
    notes: '「や」用於列舉部分例子，暗示還有其他。「と」則是完全列舉。',
    commonErrors: '',
  },
]
 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// N5 核心單字（100 個）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const N5_VOCAB: VocabItem[] = [
  // 時間
  { id:'v1', word:'今日', reading:'きょう', meaning:'今天', pos:'名詞', examples:[{jp:'今日は暑いです。',zh:'今天很熱。'}], tip:'きょう（今日）不是「こんにち」！' },
  { id:'v2', word:'明日', reading:'あした', meaning:'明天', pos:'名詞', examples:[{jp:'明日また来ます。',zh:'明天再來。'}] },
  { id:'v3', word:'昨日', reading:'きのう', meaning:'昨天', pos:'名詞', examples:[{jp:'昨日映画を見ました。',zh:'昨天看了電影。'}] },
  { id:'v4', word:'今', reading:'いま', meaning:'現在', pos:'名詞', examples:[{jp:'今何時ですか。',zh:'現在幾點？'}] },
  { id:'v5', word:'毎日', reading:'まいにち', meaning:'每天', pos:'名詞', examples:[{jp:'毎日運動します。',zh:'每天運動。'}] },
  { id:'v6', word:'朝', reading:'あさ', meaning:'早上', pos:'名詞', examples:[{jp:'朝ご飯を食べます。',zh:'吃早飯。'}] },
  { id:'v7', word:'晩', reading:'ばん', meaning:'晚上', pos:'名詞', examples:[{jp:'晩ご飯は何ですか。',zh:'晚飯是什麼？'}] },
  { id:'v8', word:'午前', reading:'ごぜん', meaning:'上午（AM）', pos:'名詞', examples:[{jp:'午前10時に来てください。',zh:'請在上午10點來。'}] },
  { id:'v9', word:'午後', reading:'ごご', meaning:'下午（PM）', pos:'名詞', examples:[{jp:'午後から雨が降ります。',zh:'下午開始下雨。'}] },
  // 家族
  { id:'v10', word:'家族', reading:'かぞく', meaning:'家人、家族', pos:'名詞', examples:[{jp:'家族と旅行します。',zh:'和家人旅行。'}] },
  { id:'v11', word:'父', reading:'ちち', meaning:'（我的）父親', pos:'名詞', examples:[{jp:'父は会社員です。',zh:'我父親是上班族。'}], tip:'說別人的父親用「お父さん（おとうさん）」' },
  { id:'v12', word:'母', reading:'はは', meaning:'（我的）母親', pos:'名詞', examples:[{jp:'母は料理が上手です。',zh:'我母親很擅長做菜。'}], tip:'說別人的母親用「お母さん（おかあさん）」' },
  { id:'v13', word:'兄', reading:'あに', meaning:'（我的）哥哥', pos:'名詞', examples:[{jp:'兄は大学生です。',zh:'我哥哥是大學生。'}] },
  { id:'v14', word:'姉', reading:'あね', meaning:'（我的）姊姊', pos:'名詞', examples:[{jp:'姉は結婚しています。',zh:'我姊姊結婚了。'}] },
  { id:'v15', word:'友達', reading:'ともだち', meaning:'朋友', pos:'名詞', examples:[{jp:'友達と遊びます。',zh:'和朋友玩。'}] },
  // 場所
  { id:'v16', word:'学校', reading:'がっこう', meaning:'學校', pos:'名詞', examples:[{jp:'学校に行きます。',zh:'去學校。'}] },
  { id:'v17', word:'駅', reading:'えき', meaning:'車站', pos:'名詞', examples:[{jp:'駅まで歩きます。',zh:'走到車站。'}] },
  { id:'v18', word:'病院', reading:'びょういん', meaning:'醫院', pos:'名詞', examples:[{jp:'病院で診てもらいます。',zh:'在醫院接受診察。'}] },
  { id:'v19', word:'銀行', reading:'ぎんこう', meaning:'銀行', pos:'名詞', examples:[{jp:'銀行でお金を下ろします。',zh:'在銀行提款。'}] },
  { id:'v20', word:'郵便局', reading:'ゆうびんきょく', meaning:'郵局', pos:'名詞', examples:[{jp:'郵便局で切手を買います。',zh:'在郵局買郵票。'}] },
  // 動詞
  { id:'v21', word:'食べる', reading:'たべる', meaning:'吃', pos:'動詞（一段）', examples:[{jp:'朝ご飯を食べます。',zh:'吃早飯。'}] },
  { id:'v22', word:'飲む', reading:'のむ', meaning:'喝', pos:'動詞（五段）', examples:[{jp:'水を飲みます。',zh:'喝水。'}] },
  { id:'v23', word:'見る', reading:'みる', meaning:'看', pos:'動詞（一段）', examples:[{jp:'テレビを見ます。',zh:'看電視。'}] },
  { id:'v24', word:'聞く', reading:'きく', meaning:'聽；問', pos:'動詞（五段）', examples:[{jp:'音楽を聞きます。',zh:'聽音樂。'},{jp:'先生に聞きます。',zh:'問老師。'}] },
  { id:'v25', word:'話す', reading:'はなす', meaning:'說話', pos:'動詞（五段）', examples:[{jp:'日本語で話します。',zh:'用日文說話。'}] },
  { id:'v26', word:'書く', reading:'かく', meaning:'寫', pos:'動詞（五段）', examples:[{jp:'手紙を書きます。',zh:'寫信。'}] },
  { id:'v27', word:'読む', reading:'よむ', meaning:'讀', pos:'動詞（五段）', examples:[{jp:'新聞を読みます。',zh:'讀報紙。'}] },
  { id:'v28', word:'買う', reading:'かう', meaning:'買', pos:'動詞（五段）', examples:[{jp:'パンを買います。',zh:'買麵包。'}] },
  { id:'v29', word:'来る', reading:'くる', meaning:'來', pos:'動詞（不規則）', examples:[{jp:'友達が来ます。',zh:'朋友要來。'}], tip:'来る是不規則動詞，て形是「来て（きて）」' },
  { id:'v30', word:'行く', reading:'いく', meaning:'去', pos:'動詞（五段）', examples:[{jp:'学校に行きます。',zh:'去學校。'}] },
  { id:'v31', word:'帰る', reading:'かえる', meaning:'回去', pos:'動詞（五段）', examples:[{jp:'家に帰ります。',zh:'回家。'}] },
  { id:'v32', word:'起きる', reading:'おきる', meaning:'起床', pos:'動詞（一段）', examples:[{jp:'7時に起きます。',zh:'7點起床。'}] },
  { id:'v33', word:'寝る', reading:'ねる', meaning:'睡覺', pos:'動詞（一段）', examples:[{jp:'11時に寝ます。',zh:'11點睡覺。'}] },
  { id:'v34', word:'勉強する', reading:'べんきょうする', meaning:'學習', pos:'動詞（サ変）', examples:[{jp:'日本語を勉強します。',zh:'學習日文。'}] },
  { id:'v35', word:'働く', reading:'はたらく', meaning:'工作', pos:'動詞（五段）', examples:[{jp:'会社で働きます。',zh:'在公司工作。'}] },
  // 形容詞
  { id:'v36', word:'大きい', reading:'おおきい', meaning:'大的', pos:'い形容詞', examples:[{jp:'大きい犬がいます。',zh:'有一隻大狗。'}] },
  { id:'v37', word:'小さい', reading:'ちいさい', meaning:'小的', pos:'い形容詞', examples:[{jp:'小さい子供です。',zh:'是小小孩。'}] },
  { id:'v38', word:'新しい', reading:'あたらしい', meaning:'新的', pos:'い形容詞', examples:[{jp:'新しい車を買いました。',zh:'買了新車。'}] },
  { id:'v39', word:'古い', reading:'ふるい', meaning:'舊的；老的', pos:'い形容詞', examples:[{jp:'古い建物です。',zh:'是舊建築。'}] },
  { id:'v40', word:'高い', reading:'たかい', meaning:'高的；貴的', pos:'い形容詞', examples:[{jp:'このレストランは高いです。',zh:'這家餐廳很貴。'}] },
  { id:'v41', word:'安い', reading:'やすい', meaning:'便宜的', pos:'い形容詞', examples:[{jp:'安いスーパーを知っていますか。',zh:'你知道便宜的超市嗎？'}] },
  { id:'v42', word:'難しい', reading:'むずかしい', meaning:'困難的', pos:'い形容詞', examples:[{jp:'日本語は難しいですか。',zh:'日文難嗎？'}] },
  { id:'v43', word:'易しい', reading:'やさしい', meaning:'容易的', pos:'い形容詞', examples:[{jp:'この問題は易しいです。',zh:'這個問題很簡單。'}] },
  { id:'v44', word:'面白い', reading:'おもしろい', meaning:'有趣的', pos:'い形容詞', examples:[{jp:'この映画は面白いです。',zh:'這部電影很有趣。'}] },
  { id:'v45', word:'好き', reading:'すき', meaning:'喜歡', pos:'な形容詞', examples:[{jp:'音楽が好きです。',zh:'喜歡音樂。'}] },
  { id:'v46', word:'嫌い', reading:'きらい', meaning:'討厭', pos:'な形容詞', examples:[{jp:'虫が嫌いです。',zh:'討厭蟲子。'}] },
  { id:'v47', word:'便利', reading:'べんり', meaning:'方便', pos:'な形容詞', examples:[{jp:'この駅は便利です。',zh:'這個車站很方便。'}] },
  { id:'v48', word:'大切', reading:'たいせつ', meaning:'重要；珍貴', pos:'な形容詞', examples:[{jp:'健康が大切です。',zh:'健康很重要。'}] },
  // 食べ物
  { id:'v49', word:'ご飯', reading:'ごはん', meaning:'飯；餐', pos:'名詞', examples:[{jp:'ご飯を食べましょう。',zh:'吃飯吧。'}] },
  { id:'v50', word:'水', reading:'みず', meaning:'水', pos:'名詞', examples:[{jp:'水を一杯ください。',zh:'請給我一杯水。'}] },
]
 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// N5 漢字（80 個）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const N5_KANJI: KanjiItem[] = [
  {
    id:'k1', char:'日', on:['ニチ','ジツ'], kun:['ひ','か'], meaning:'日、太陽', strokes:4,
    words:[{word:'日本',reading:'にほん',meaning:'日本'},{word:'今日',reading:'きょう',meaning:'今天'},{word:'毎日',reading:'まいにち',meaning:'每天'}],
  },
  {
    id:'k2', char:'本', on:['ホン'], kun:['もと'], meaning:'書、本、根本', strokes:5,
    words:[{word:'本',reading:'ほん',meaning:'書'},{word:'日本',reading:'にほん',meaning:'日本'},{word:'本当',reading:'ほんとう',meaning:'真的'}],
  },
  {
    id:'k3', char:'人', on:['ジン','ニン'], kun:['ひと'], meaning:'人', strokes:2,
    words:[{word:'人',reading:'ひと',meaning:'人'},{word:'日本人',reading:'にほんじん',meaning:'日本人'},{word:'何人',reading:'なんにん',meaning:'幾個人'}],
  },
  {
    id:'k4', char:'山', on:['サン'], kun:['やま'], meaning:'山', strokes:3,
    words:[{word:'山',reading:'やま',meaning:'山'},{word:'富士山',reading:'ふじさん',meaning:'富士山'},{word:'山田',reading:'やまだ',meaning:'山田（姓氏）'}],
  },
  {
    id:'k5', char:'川', on:['セン'], kun:['かわ'], meaning:'川、河', strokes:3,
    words:[{word:'川',reading:'かわ',meaning:'河川'},{word:'小川',reading:'おがわ',meaning:'小河'},{word:'川口',reading:'かわぐち',meaning:'川口（地名）'}],
  },
  {
    id:'k6', char:'火', on:['カ'], kun:['ひ'], meaning:'火', strokes:4,
    words:[{word:'火曜日',reading:'かようび',meaning:'星期二'},{word:'花火',reading:'はなび',meaning:'煙火'},{word:'火',reading:'ひ',meaning:'火'}],
  },
  {
    id:'k7', char:'水', on:['スイ'], kun:['みず'], meaning:'水', strokes:4,
    words:[{word:'水',reading:'みず',meaning:'水'},{word:'水曜日',reading:'すいようび',meaning:'星期三'},{word:'水泳',reading:'すいえい',meaning:'游泳'}],
  },
  {
    id:'k8', char:'木', on:['モク','ボク'], kun:['き'], meaning:'樹木', strokes:4,
    words:[{word:'木',reading:'き',meaning:'樹'},{word:'木曜日',reading:'もくようび',meaning:'星期四'},{word:'木村',reading:'きむら',meaning:'木村（姓氏）'}],
  },
  {
    id:'k9', char:'金', on:['キン','コン'], kun:['かね','かな'], meaning:'金錢、金色', strokes:8,
    words:[{word:'お金',reading:'おかね',meaning:'錢'},{word:'金曜日',reading:'きんようび',meaning:'星期五'},{word:'金色',reading:'きんいろ',meaning:'金色'}],
  },
  {
    id:'k10', char:'土', on:['ド','ト'], kun:['つち'], meaning:'土、土地', strokes:3,
    words:[{word:'土',reading:'つち',meaning:'土壤'},{word:'土曜日',reading:'どようび',meaning:'星期六'},{word:'土地',reading:'とち',meaning:'土地'}],
  },
  {
    id:'k11', char:'月', on:['ゲツ','ガツ'], kun:['つき'], meaning:'月亮、月份', strokes:4,
    words:[{word:'月',reading:'つき',meaning:'月亮'},{word:'月曜日',reading:'げつようび',meaning:'星期一'},{word:'今月',reading:'こんげつ',meaning:'本月'}],
  },
  {
    id:'k12', char:'学', on:['ガク'], kun:['まな'], meaning:'學習', strokes:8,
    words:[{word:'学校',reading:'がっこう',meaning:'學校'},{word:'学生',reading:'がくせい',meaning:'學生'},{word:'大学',reading:'だいがく',meaning:'大學'}],
  },
]
 
// 取得特定等級的內容
export function getLevelContent(level: JLPTLevel) {
  switch(level) {
    case 'N5': return { grammar: N5_GRAMMAR, vocab: N5_VOCAB, kanji: N5_KANJI }
    default:   return { grammar: N5_GRAMMAR.slice(0,5), vocab: N5_VOCAB.slice(0,20), kanji: N5_KANJI.slice(0,6) }
  }
}
