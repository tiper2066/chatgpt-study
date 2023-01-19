import bot from '/assets/bot.svg'; // 봇 아이콘
import user from '/assets/user.svg'; // 유저 아이콘

const form = document.querySelector('form'); // 폼
const chatContainer = document.querySelector('#chat_container'); // 체팅 리스트 영역

let loadInterval; // 로딩 타이머를 담을 변수 선언

// 데이터 가져올 동안 표시될 로딩 애님 함수 (...쩜쩜쩜)
function loader(element) {
    element.textContent = '';
    loadInterval = setInterval(() => {
        element.textContent += '.'; // 0.3 초 마다 쩜을 추가함
        if (element.textContent === '....') {
            element.textContent = ''; // 쩜이 4개면 다시 초기화
        }
    }, 300);
}

// 데이터를 타이핑으로 출력하는 함수
function typeText(element, text) {
    let index = 0;
    let interval = setInterval(() => {
        // 현재 글자가 전체 문자열 길이보다 작은 위치에 있으면
        if (index < text.length) {
            element.innerHTML += text.charAt(index); // 0.02초 마다 다음 글자를 추가(나타나게) 함
            index++; // 위치값 증가
        }
        // 현재 글자 위치가 전체 글자 보다 같거나 커지면...
        else {
            clearInterval(interval); // 진행을 멈춘다
        }
    }, 20);
}

// 유니크 ID 생성 함수
function generateUniqueId() {
    const timestamp = Date.now(); // 현재 시간 저장 (13자리숫자)
    const randomNumber = Math.random(); // 0-0.99999 까지 랜덤 숫자 저장
    const hexadecimalString = randomNumber.toString(16); // 숫자를 16진수 문자열로 변경(0.숫자영문썩임)
    return `id-${timestamp}-${hexadecimalString}`;
}

// chatContainer 에 채팅 결과를 번갈아 HTML 요소로 출력하는 함수 (ai인지 여부, 출력데이터, id)
function chatStripe(isAi, value, uniqueId) {
    return `
        <div class="wrapper ${isAi && 'ai'}"> <!-- ai 일 경우만 클래스 추가 -->
            <div class="chat">
                <div class="profile">
                    <img 
                      src="${isAi ? bot : user}"
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
}

// 폼 submit 이벤트 핸들러
const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(form); // form 에 있는 모든 데이터값이 배열로 전달된다.

    // user 요청한 값들을 출력
    chatContainer.innerHTML += chatStripe(false, data.get('prompt')); // 인자1 : ai 가 아님, 인자2: textarea 값 출력, 인자3: id 없음
    // 출력이 끝나면 textarea 값 제거
    form.reset();

    // bot 이 응답한 결과값들을 출력
    const uniqueId = generateUniqueId(); // ID 생성
    chatContainer.innerHTML += chatStripe(true, ' ', uniqueId); // 인자1: 봇, 인자2: 아직 응답값 없음으로, 인자3: id 값

    console.log('data: ', data.get('prompt'));

    // 현재 위치를 제일 하단으로 이동
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // 값이 표시될 엘리먼트를 할당함
    const messageDiv = document.getElementById(uniqueId);

    // 로더를 표시함
    loader(messageDiv);

    // 서버로 OpenAI API 요청하기
    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt'),
        }),
    });

    clearInterval(loadInterval); // 데이터 로딩 완료되면 로딩애님 제거
    messageDiv.innerHTML = ''; // 이전 출력된 메시지 영역의 값을 비워준다.

    // OpenAI API 에서 정상적으로 결과가 오면...
    if (response.ok) {
        console.log('응답성공');
        const data = await response.json(); // 결과값을 json 으로 파싱하고
        const parsedData = data.bot.trim(); // 결과값 중에서 ai 가 생성한 문자열을 공백제거한 후

        console.log('parsedData', parsedData);

        typeText(messageDiv, parsedData); // 출력대상요소와 결과값을 전달해서 타이핑되게 출력한다.
    }
    // 응답이 실패하면...
    else {
        const err = await response.text(); // 에러 관련 문자열을 받아서..
        messageDiv.innerHTML = '뭔가 문제가 발생했습니다.'; // 알려주고..
        alert(err); // 에러 코드를 팝업으로 보여준다.
    }
};

// 폼 submit 이벤트 추가
form.addEventListener('submit', handleSubmit);
// textarea 에 엔터 칠 때마다 실행할 코드
form.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        handleSubmit(e);
    }
});
