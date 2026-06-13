# バックパックすごろくバトル

人生ゲーム風のすごろくに、バックパック配置型の自動戦闘を組み合わせたローカル対戦サイトです。

## 遊べる内容

- 2〜4人プレイ
- ゲーム開始前にマス数を24〜200で設定
- 試合ごとに横スクロール型のランダムマップを生成
- プレイヤーごとに絵文字アバターを選択
- オンライン中は担当プレイヤー以外のバックパックを非公開
- 1〜100ダイスで行動順を決定
- 行動ターンでは1〜6ダイスで移動
- プラス、マイナス、ラッキー、ショップ、鍛造、戦闘、ゴールの各マス
- プラスマス多め、ラッキー/戦闘/鍛造/ショップは控えめ
- 戦闘マスは15マス目以降から出現
- プレイヤーの初期手持ちアイテムなし
- 4×4から始まるバックパック
- 手持ちアイテムは3つまで。自分の次ターン開始時に超過分がランダム削除
- 戦闘前20秒の準備時間
- 配置アイテムによる自動戦闘
- 全員が2回ずつ行動するごとの全体イベント
- ゴール到達で最終対決
- ブラウザ保存と読み込み

## ローカル確認

このフォルダで簡易サーバーを起動します。

```powershell
python -m http.server 5173
```

ブラウザで開きます。

```text
http://localhost:5173
```

## GitHub に置く

```powershell
git init
git add .
git commit -m "Create sugoroku backpack battle prototype"
git branch -M main
git remote add origin <GitHubのリポジトリURL>
git push -u origin main
```

## Firebase Hosting に公開する

Firebase CLI にログインし、Firebase プロジェクトを作成済みの状態で実行します。

```powershell
firebase login
firebase use --add
firebase deploy
```

## オンライン対戦の準備

Firebase コンソールで次を有効にします。

- Authentication: Anonymous / 匿名ログイン
- Firestore Database: Native mode
- Hosting

サイトを開いたら、Firebase プロジェクト設定の Web アプリ設定を「オンライン部屋」に貼り付けます。

```js
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  appId: "..."
}
```

部屋を作る側は「部屋を作る」を押します。表示された4桁の数字コードを他の端末へ共有してください。

参加する側は同じサイトを開き、部屋コードを入力して「部屋に入る」を押します。担当プレイヤーは空いている番号に自動で割り振られます。

## Firebase ルール

`firestore.rules` は匿名ログイン済みユーザーだけが `sugorokuRooms` を読み書きできる最低限のルールです。無料枠で試すプロトタイプ向けなので、本格公開時は部屋の参加者管理や操作権限の検証を強化してください。

この構成は静的サイトなので、Firebase Hosting の無料枠から始めやすい形です。オンライン同期は Firestore、端末識別は匿名ログインを使います。
