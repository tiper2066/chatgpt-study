import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
dotenv.config(); //.env 에 설정값을 사용하게 함
const port = process.env.PORT || 5000; // .env 에 설정된 포트 지정

// OpenAI API 키 가져옴
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const app = express();
app.use(cors());
app.use(express.json());

// 홈 라우팅 요청하면.. 인사말 전달
app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello From CodeX',
    });
});
// 자연어 명령을 이용해서 OpenAi 서비스를 호출하도록 요청함 (Natural language to OpenAI API 이용)
app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt; // textarea 의 입력값 저장

        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `${prompt}`,
            temperature: 0, // 값이 높을 수록 광범위해서 적절치 못하고 신뢰할 수 없게 응답함
            max_tokens: 2000, // 값이 높을 수록 완성도 높고 긴 응답 제공
            // top_p: 누적 확률 분포를 계산하고 해당 분포가 top_p 값을 초과하는 즉시 차단됨.
            top_p: 1, // 예를 들어 0.3의 top_p는 상위 30% 확률 질량을 구성하는 토큰만 고려됨을 의미함
            frequency_penalty: 0.5, // 유사한 응답을 반복하지 않도록 함(-2~2사이)
            presence_penalty: 0, // 값이 높을 수록 지금까지 결과를 기반으로 새로운 주제를 언급할 가능성이 높다.
            // stop: ['"""'], // 해당 문장에서 멈추도록 함, 여기서는 필요없음
        });
        // 요청이 성공하고 응답이 올 경우, status 200~209 사이의 경우
        res.status(200).send({
            bot: response.data.choices[0].text, // ai 가 응답한 문장을 가져옴
        });
    } catch (error) {
        console.log(error); // 콘솔에 에러 출력
        res.status(500).send({ error }); // 브라우저에 에러 전달(출력)
    }
});

app.listen(port, () => console.log(`Start Server on port ${port}`));
