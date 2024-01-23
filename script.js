// Seleciona o elemento canvas e obtém seu contexto 2D
const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

// Seleciona elementos do DOM relacionados ao score, finalScore, menu e botão de jogar
const score = document.querySelector(".score--value")
const finalScore = document.querySelector(".final-score > span")
const menu = document.querySelector(".menu-screen")
const buttonPlay = document.querySelector(".btn-play")

// Cria um objeto de áudio para reproduzir um som quando a cobra come algo
const audio = new Audio("assets/audio.mp3")

// Define o tamanho de cada bloco na grade do jogo
const size = 30

// Define a posição inicial da cobra
const initialPosition = { x: 270, y: 240 }

// Inicializa a cobra com a posição inicial
let snake = [initialPosition]

// Função para incrementar a pontuação exibida no elemento HTML em 10 unidades
const incrementScore = () => {
    score.innerText = +score.innerText + 10
}

// Função para gerar um número aleatório dentro de um intervalo
const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

// Função para obter uma posição aleatória na grade do jogo
const randomPosition = () => {
    // Gera um número aleatório dentro do intervalo (0, canvas.width - size)
    const number = randomNumber(0, canvas.width - size)

    // Arredonda o número para o múltiplo mais próximo de 'size'
    return Math.round(number / 30) * 30
}

// Função para gerar uma cor aleatória em formato RGB
const randomColor = () => {
    // Gera valores aleatórios para os componentes de cor (vermelho, verde, azul)
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)

    // Retorna a cor no formato RGB
    return `rgb(${red}, ${green}, ${blue})`
}

// Objeto que representa a comida no jogo
const food = {
    // Inicializa a posição da comida de forma aleatória na grade do jogo
    x: randomPosition(),
    y: randomPosition(),

    // Inicializa a cor da comida de forma aleatória
    color: randomColor()
}

// Variáveis para armazenar a direção da cobra e o ID do loop do jogo
let direction, loopId

// Função para desenhar a comida na tela
const drawFood = () => {
    // Extrai as propriedades x, y e color do objeto food
    const { x, y, color } = food

    // Configuração de sombras para efeito visual
    ctx.shadowColor = color
    ctx.shadowBlur = 6

    // Preenche um retângulo na posição da comida com a cor especificada
    ctx.fillStyle = color
    ctx.fillRect(x, y, size, size)

    // Desativa o efeito de sombras para outras operações de desenho
    ctx.shadowBlur = 0
}

// Função para desenhar a cobra na tela
const drawSnake = () => {
    // Define a cor de preenchimento inicial para os blocos da cobra
    ctx.fillStyle = "#ddd"

    // Itera sobre cada posição na cobra
    snake.forEach((position, index) => {
        // Verifica se a posição é a cabeça da cobra (última posição no array)
        if (index == snake.length - 1) {
            // Se for a cabeça, define a cor de preenchimento como branca
            ctx.fillStyle = "white"
        }

        // Desenha um bloco da cobra na posição especificada
        ctx.fillRect(position.x, position.y, size, size)
    })
}

// Função para movimentar a cobra na direção atual
const moveSnake = () => {
    // Verifica se há uma direção definida
    if (!direction) return

    // Obtém a posição da cabeça da cobra
    const head = snake[snake.length - 1]

    // Direção para Direita
    if (direction == "right") {
        // Adiciona um novo bloco à direita da cabeça
        snake.push({ x: head.x + size, y: head.y })
    }

    // Direção para Esquerda
    if (direction == "left") {
        // Adiciona um novo bloco à esquerda da cabeça
        snake.push({ x: head.x - size, y: head.y })
    }

    // Direção para Baixo
    if (direction == "down") {
        // Adiciona um novo bloco abaixo da cabeça
        snake.push({ x: head.x, y: head.y + size })
    }

    // Direção para Cima
    if (direction == "up") {
        // Adiciona um novo bloco acima da cabeça
        snake.push({ x: head.x, y: head.y - size })
    }

    // Remove o primeiro bloco da cobra (cauda) para manter o tamanho constante
    snake.shift()
}

// Função para desenhar a grade do jogo na tela
const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = "#191919"

    // Desenha a grade do jogo na tela, percorrendo a largura do canvas em intervalos de 30 pixels
    for (let i = 30; i < canvas.width; i += 30) {
        // Inicia um novo caminho no contexto 2D
        ctx.beginPath()

        // Desenha uma linha vertical na posição atual (i, 0) até (i, 600)
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)

        // Realiza o traçado da linha no canvas
        ctx.stroke()

        // Inicia outro caminho para desenhar uma linha horizontal
        ctx.beginPath()

        // Desenha uma linha horizontal na posição atual (0, i) até (600, i)
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)

        // Realiza o traçado da linha no canvas
        ctx.stroke()
    }
}

// Função para verificar se a cobra comeu a comida
const chackEat = () => {
    // Obtém a posição da cabeça da cobra
    const head = snake[snake.length - 1]

    // Verifica se a cabeça da cobra está na mesma posição que a comida
    if (head.x == food.x && head.y == food.y) {
        // Incrementa a pontuação
        incrementScore()

        // Adiciona um novo bloco à cobra (cabeça)
        snake.push(head)

        // Reproduz o som de comer
        audio.play()

        // Gera novas coordenadas para a comida
        let x = randomPosition()
        let y = randomPosition()

        // Garante que a nova posição da comida não colida com a cobra
        while (snake.find((position) => position.x == x && position.y == y)) {
            x = randomPosition()
            y = randomPosition()
        }

        // Atualiza as coordenadas e a cor da comida
        food.x = x
        food.y = y
        food.color = randomColor()
    }
}

// Função para verificar colisões com as bordas ou com a própria cobra
const checkCollision = () => {
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length - 2

    // Verifica colisão com as bordas do canvas
    const wallCollision =
        head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    // Verifica colisão com o próprio corpo da cobra
    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })

    // Se houver colisão, encerra o jogo
    if (wallCollision || selfCollision) {
        gameOver()
    }
}

// Função chamada quando o jogo termina
const gameOver = () => {
    direction = undefined

    // Exibe a tela de menu e atualiza a pontuação final
    menu.style.display = "flex"
    finalScore.innerText = score.innerText
    canvas.style.filter = "blur(2px)"
}

// Função principal do loop do jogo
const gameLoop = () => {
    clearInterval(loopId)

    // Limpa o canvas antes de desenhar os elementos do jogo
    ctx.clearRect(0, 0, 600, 600)

    // Desenha a grade do jogo
    drawGrid()

    // Desenha a comida
    drawFood()

    // Move a cobra
    moveSnake()

    // Desenha a cobra
    drawSnake()

    // Verifica se a cobra comeu a comida
    chackEat()

    // Verifica colisões
    checkCollision()

    // Configura o próximo ciclo do loop
    loopId = setTimeout(() => {
        gameLoop()
    }, 300)
}

// Inicia o loop do jogo
gameLoop()

// EventListener pra capturar as teclas de seta e alterar a direção da cobra
document.addEventListener("keydown", ({ key }) => {
    // Verifica se a tecla pressionada é a seta para a direita e a cobra não está indo para a esquerda
    if (key == "ArrowRight" && direction != "left") {
        // Atualiza a direção da cobra para a direita
        direction = "right"
    }

    // Verifica se a tecla pressionada é a seta para a esquerda e a cobra não está indo para a direita
    if (key == "ArrowLeft" && direction != "right") {
        // Atualiza a direção da cobra para a esquerda
        direction = "left"
    }

    // Verifica se a tecla pressionada é a seta para baixo e a cobra não está indo para cima
    if (key == "ArrowDown" && direction != "up") {
        // Atualiza a direção da cobra para baixo
        direction = "down"
    }

    // Verifica se a tecla pressionada é a seta para cima e a cobra não está indo para baixo
    if (key == "ArrowUp" && direction != "down") {
        // Atualiza a direção da cobra para cima
        direction = "up"
    }
})

// EventListener para reiniciar o jogo quando o botão de jogar é clicado
buttonPlay.addEventListener("click", () => {

    // Reinicia a pontuação
    score.innerText = "00"

    // Esconde o menu
    menu.style.display = "none"

    // Remove o efeito de desfoque do canvas
    canvas.style.filter = "none"

    // Reinicia a cobra com a posição inicial
    snake = [initialPosition]
})