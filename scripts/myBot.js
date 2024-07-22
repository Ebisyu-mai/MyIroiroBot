let gameNum, answerNum;
let game1Start = 0;
let gameAnswer = [];
let hit, blow;
let drawThema = 0;
let game2Start = 0;
let foodThema = [];
let foodThemaEng = [];
let drawQuestion;
let mondai;
let result = [];

const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
const fs = require("fs");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
const api_key = "00693a4ed2a7449c96d4f177452cd1b7";
metadata.set("authorization", "Key " + api_key);


module.exports = (robot) => {
  let questionSentId = {};

  robot.respond(/メニュー$/i, (res) => {
    if (gameNum === 1 || gameNum === 2) {
      res.send('今やってるゲームをやめたい場合「やめる」と入力してください');
    }
    else {
      res.send({
        question: 'どのゲームで遊びますか？',
        options: ['Hit & Blow', 'お絵描きバトル'],
        onsend: (sent) => {
          questionSentId[res.message.rooms[res.message.room].id] = sent.message.id;
        }
      });
    }
  });

  robot.respond(/やめる$/i, (res) => {
    if (gameNum === 1 || gameNum === 2) {
      res.send({
        question:'今やっているゲームをやめてホームに戻りますか？',
        options:['はい', 'いいえ']
      });
    }
    else {
      res.send('ご利用ありがとうございました。');
    }
  });

  robot.respond('select', (res) => {
    if (res.json.response === null) {
      res.send(`Your question is ${res.json.question}.`);
    }
    else {
      res.send({
        text: `${res.json.options[res.json.response]} が選ばれました.`
      });
    }

    if (res.json.options[res.json.response] === 'はい') {
      res.send('ゲームを終了します。');
      gameNum = 0;
      game1Start = 0;
      game2Start = 0;
    }

    if (res.json.options[res.json.response] === 'Hit & Blow') {
      gameNum = 1
      answerNum = 10
      var arr = [1,2,3,4,5,6,7,8,9];
      var i = 0
      while (i < 5) {
        let j = Math.floor( Math.random() * arr.length);
        gameAnswer[i] = arr[j];
        i++;
        arr.splice( j, 1 );
      }
      res.send({
        text:'まずはルールを説明します' + "\n" + 'コンピュータが選んだ５桁の数字を当てるゲームです。' + "\n" + '重複しない数字を予測して入力すると、正解の数字と比べた結果が返ってきす。' + "\n" + '桁の位置と数字が同じだとHit。桁の位置は違うが数字が同じだとBlow。' + "\n" + 'これらの情報からコンピュータが選んだ数字を予測し10回以内に当ててください。'
      });
    }
    else if (res.json.options[res.json.response] === 'お絵描きバトル') {
      gameNum = 2
      res.send('ここではお絵描きバトルに挑戦できます。' + "\n" + '出されたお題に対して絵を描き、その絵をこのbotに送ってください' + "\n" + 'あなたの画力をこのbotが判定します' + "\n" + '問題は5問です');
      res.send({
        question:'どのテーマでお絵描きしますか？',
        options:['果物・野菜', '動物', 'スポーツ', '文房具']
      });
    }
    else if (res.json.options[res.json.response] === '果物・野菜') {
      drawThema = 1;
      foodThema = ['りんご', 'バナナ', 'さくらんぼ', 'スイカ', 'ブドウ', 'パイナップル', 'レモン', 'いちご', '桃', '柿', 'ブロッコリー', 'トマト', 'ナス', 'ピーマン', '玉ねぎ']
      foodThemaEng = ['Apple', 'Banana', 'Cherry', 'Watermelon', 'Grapes', 'Pineapple', 'Lemon', 'Strawberry', 'Peach', 'persimmon', 'Broccoli', 'Tomato', 'Eggplant', 'Greenpepper', 'Onion'];
    }
  });

  const onfile = (res, file) => {
    res.download(file, (path) => {
        const imageBytes = fs.readFileSync(path, { encoding: "base64" }); // ファイルを読み込んでbase64エンコード
        stub.PostModelOutputs( // Clarifai APIの呼び出し
            {
                model_id: "drawFoodModel",  // 画像認識モデルのIDを指定
                inputs: [{ data: { image: { base64: imageBytes } } }]  // base64エンコードした画像データを入力として設定
            },
            metadata,
            (err, response) => {  // コールバック関数
                if (err) {
                    res.send("Error: " + err);  // 何かエラーがあればエラーメッセージを返す
                    return;
                }

                if (response.status.code !== 10000) {  // ステータスコードが10000以外の場合はエラーメッセージを返す
                    res.send("Received failed status: " + response.status.description + "\n" + response.status.details + "\n" + response.status.code);
                    return;
                }

                //これ以降が正常な場合の処理

                if (gameNum === 2 && game2Start === 1) {
                  let drawPoint;
                  let str = foodThemaEng[mondai];
                  for (const c of response.outputs[0].data.concepts) {
                    if (str === c.name) {   
                      drawPoint = Math.floor(c.value * 100);
                      result[drawQuestion - 1] = drawPoint;
                    }
                  }
                  foodThema.splice( mondai, 1 );
                  foodThemaEng.splice(mondai, 1);
                  res.send('あなたの点数は' + result[drawQuestion - 1] + '点だったよ！');
                  drawQuestion++;
                }

                if (drawQuestion === 6) {
                  let resultPoint = 0;
                  let i = 0;
                  while (i < 5) {
                    resultPoint+=result[i];
                    i++;
                  }
                  res.send('結果発表！' + '\n' + 'あなたの点数は' + resultPoint + '点だったよ！');

                  if (resultPoint > 400) {
                    res.send('あなたってとっても絵が上手なんだね');
                  }
                  else if (resultPoint > 300) {
                    res.send('あなたの絵はまあ上手ね！引き続き精進なさい');
                  }
                  else if (resultPoint > 100) {
                    res.send('まあ人に伝わるレベルの絵は描けるのね');
                  }
                  else {
                    res.send('絵が壊滅的ー！何描いてるか全然わからなかったわ！');
                  }
                  gameNum = 0;
                  game2Start = 0;
                }
                else {
                  mondai = Math.floor( Math.random() * foodThema.length);
                  res.send(drawQuestion + '問目のお題は『' + foodThema[mondai] + '』です！');
                }
            }
        );
    });
};

robot.respond('file', (res) => {  // ファイルがアップロードされたときの処理
    onfile(res, res.json);
});

  robot.hear(/(.*)/, (res) => {
    const txt = res.match[1];
    if (gameNum === 1) {
      if (game1Start === 1) {
        hit = 0;
        blow = 0;
        if (res.match[1].length !== 11) {
          res.send({
            text:'文字数に過不足があります。５桁の数字を入力してください'
          })
        } 
        else  {
          var i = 0;
          while (i < 5) {
            if (Number(txt.charAt(i + 6)) === gameAnswer[i]) {
              hit++;
            }
            i++
          }
          
          i = 0;
          while (i < 5) {
            var j = 0;
            while (j < 5) {
              if (Number(txt.charAt(i + 6)) === gameAnswer[j] && i !== j) {
                blow++;
              }
              j++;
            }
            i++;
          }
        }
        
        if (hit === 5) {
          res.send('おめでとうございます！正解です');
          gameNum = 0
          game1Start = 0
        }
        else if (answerNum > 1) {
          answerNum--;
          res.send('今の回答はhit:'+ hit + ' blow:' + blow + ' でした' + "\n" + 'あなたの残りの回答回数は' + answerNum + '回です' + "\n" + '数字を入力してください');
        }
        else {
          res.send('残念。回数以内に数字を当てることができませんでした。' + "\n" + '答えは' + gameAnswer[0] + gameAnswer[1] + gameAnswer[2] + gameAnswer[3] + gameAnswer[4] + 'でした。')
          gameNum = 0
          game1Start = 0
        }
      }
      else if (txt === 'Hubot スタート') {
        res.send({
          text:'あなたの残りの回答回数は' + answerNum + '回です' + "\n" + '数字を入力してください'
        });
        game1Start = 1;
      }
      else {
        res.send('始めるには「スタート」と入力してください');
      }
      
    }
    else if (gameNum === 2) {
      if (txt === 'Hubot スタート' && gameNum === 2) {
        drawQuestion = 1;
        mondai = Math.floor( Math.random() * foodThema.length);
        res.send(drawQuestion + '問目のお題は『' + foodThema[mondai] + '』です！');
        game2Start = 1;
      }
      else if (drawThema !== 0 && game2Start === 0) {
        res.send('始めるには「スタート」と入力してください');
      }

    }
    else if (txt !== 'Hubot メニュー') {
      res.send('何かご用がある場合は「メニュー」と入力してください');
    }
  });
};

