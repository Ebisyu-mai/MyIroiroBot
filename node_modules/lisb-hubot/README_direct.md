# hubot 拡張

このドキュメントは、direct 用に hubot を拡張した点について整理しています。


## メッセージの送信

以下のコードブロックの内側についてのものとします。

	module.exports = (robot) ->
		robot.respond /.../i, (msg) ->
			# here

### テキスト (hubot)

	msg.send "This message is text."

もしくは、以下も同等です。

	msg.send
		text: "This message is text."

### スタンプ
	
	msg.send
		stamp_set: "3"
		stamp_index: "1152921507291203198"
  		text: "おはよう"  # (Option) テキスト付きスタンプの場合のみ

※ stamp_set と stamp_index は、ブラウザの「要素の検証」等で確認してください。

	<img src="./images/stamp/3/1152921507291203198.png">
	

### Yes/No スタンプ

	msg.send
		question: "質問内容"

### セレクトスタンプ

	msg.send
	    question: "質問内容"
	    options: ["選択肢1", "選択肢2", "選択肢3"]

### タスクスタンプ

	msg.send
		title: "すること"
		closing_type: 0  # (Option) 誰かが:0, 全員が:1

### ファイル

	msg.send
		path: "your/file/name.png"
		name: "name.png"    # (Option) アップロード名
		type: "image/png"   # (Option) MIME
	

## メッセージの受信

以下のコードブロックの内側についてのものとします。

	module.exports = (robot) ->
		# here


### テキスト (hubot)

	robot.respond /(.*)/, (msg) ->
		msg.send "Your message is #{msg.match[1]}"

### スタンプ

	robot.respond "stamp", (msg) ->
		msg.send "#{msg.json.stamp_set} - #{msg.json.stamp_index}"

### Yes/No スタンプ

	robot.respond "yesno", (msg) ->
		if not msg.json.response?
			msg.send "Your question is #{msg.json.question}."
		else
			msg.send "Your answer is #{msg.json.response}."

### セレクトスタンプ

	robot.respond "select", (msg) ->
		if not msg.json.response?
			msg.send "Your question is #{msg.json.question}."
		else
			msg.send "Your answer is #{msg.json.options[msg.json.response]}."

### タスクスタンプ

	robot.respond "task", (msg) ->
		if not msg.json.done?
			msg.send "Your task is #{msg.json.title}."
		else
			msg.send "Your task is #{if msg.json.done then 'done' else 'undone'}."

### ファイル

	robot.respond "file", (msg) ->
		msg.send "File received. name: #{msg.json.name} type: #{msg.json.content_type} 
			size: #{msg.json.content_size}bytes"
		msg.download msg.json, (path) ->
			msg.send "downloaded to #{path}"

### 位置情報

	robot.respond "map", (msg) ->
		msg.send "Your location is #{msg.json.place} at #{msg.json.lat}, #{msg.json.lng}"

## トークルーム情報の取得

以下のコードブロックの内側についてのものとします。

	module.exports = (robot) ->
		robot.respond /room/i, (msg) ->
			# here

### トークルームの種類

 	msg.send "This room type is " + ["unknown", "pair", "group"][msg.message.roomType]

### トークルーム名

	if msg.message.roomType == 2  # Group talk
		msg.send "Group name is #{msg.message.roomTopic}"

### トークルーム名の変更 (hubot)

	msg.topic "BotGroup"

### トークルームの参加者情報

	text = ""
	for user in msg.message.roomUsers
	    text += "#{user.name} #{user.email} #{user.profile_url}\n\n" 
    msg.send text

### トークルームの一覧

	text = ""
	for id,talk of msg.message.rooms
	    text += "name:#{talk.topic} type:#{talk.type} users:#{talk.users}\n\n" 
    msg.send text

※ msg オブジェクトが利用できない場合は、`msg.message.rooms` の代わりに `robot.brain.rooms()` も利用できます (注：関数呼出しになります)。


## 連絡先情報の取得

以下のコードブロックの内側についてのものとします。

	module.exports = (robot) ->
		robot.respond /users/i, () ->
			# here

### 連絡先の一覧 (hubot)
	
	users = robot.brain.users()
	console.log users   # { id0:user0, id1:user1, ... }

### IDによる連絡先の検索 (hubot)

	userId = Object.keys(users)[0]
	console.log robot.brain.userForId(userId)

### 名前による連絡先の検索 (hubot)

	user = users[userId]
	console.log robot.brain.userForName(user.name)

※ その他にも、`usersForRawFuzzyName` (先頭一致)、`usersForFuzzyName` (先頭一致、ただし、完全一致を優先) も利用できます。

## イベント

以下のコードブロックの内側についてのものとします。

	module.exports = (robot) ->
		# here

### ペアトークでのメッセージ受信 (hubot)

	robot.respond /.../, (msg) ->
		msg.send ""

※ `respond` はグループトーク中の「@hubot名 メッセージ」の場合でも呼ばれます。厳密にペアトークのみに対応させたいときは`if msg.message.roomType == 1` で場合分けしてください。

### グループトークでのメッセージ受信 (hubot)
 
	robot.hear /.../, (msg) ->
		msg.send ""

### トークルーム名の変更 (hubot)

	robot.topic (msg) ->
		msg.send "Topic is changed: #{msg.message.text}"

### トークルームへのユーザーの参加 (hubot)

	robot.enter (msg) ->
		msg.send "Hi! #{msg.message.user.name}"

### トークルームからのユーザーの退出 (hubot)

	robot.leave (msg) ->
		msg.send "Good bye! #{msg.message.user.name}"

### 招待による自分自身のトークルームへの参加

	robot.join (msg) ->
		msg.send "Nice to meet you!"

### メッセージの未読・既読

	robot.respond /read after/, (msg) ->
		msg.send
			text: "Read thie message, please!"
			onsend: (sent) ->
				setTimeout ->
					text = []
					text.push "#{user.name} read after 5sec." for user in sent.readUsers
					text.push "#{user.name} did't read after 5sec." for user in sent.unreadUsers
					msg.send text.join("\n")
				, 5000

リアルタイムに未読・既読を知りたい場合は、以下のようにします。

	robot.respond /read now/, (msg) ->
		msg.send
			text: "Read thie message, please!"
			onread: (readNowUsers, readUsers, unreadUsers) ->
				text = []
				text.push "#{user.name} read now." for user in readNowUsers
				msg.send text.join("\n")

## その他

### トークルームからの退出

	msg.leave()

### 一斉連絡の送信

    msg.announce "THIS IS AN ANNOUNCEMENT!"

※ アカウントに管理者権限が必要です。
