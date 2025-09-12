# Juego del Impostor

Este es un juego de deducción social en tiempo real donde los jugadores deben colaborar para identificar al impostor entre ellos. El juego está construido con React y utiliza Socket.IO para la comunicación en tiempo real.

## Sobre el Juego

El juego está inspirado en juegos de deducción social como Among Us y Mafia. Al principio del juego se elige un impostor en secreto. Los demás jugadores no saben quién es el impostor. El objetivo de los jugadores es desenmascarar al impostor, mientras que el objetivo del impostor es eliminar a los demás jugadores sin ser descubierto.

## Cómo Jugar

El juego se desarrolla en rondas, y cada ronda consta de varias fases:

1.  **Lobby (Sala de espera):** Los jugadores se unen a una sala de juego (`sala`). Cuando se han unido suficientes jugadores, el anfitrión puede iniciar el juego.

2.  **Fase de Comentario:** En esta fase, se presenta un tema o una pregunta a los jugadores. Cada jugador debe escribir un comentario. Sin embargo, el impostor no ve el tema y debe escribir un comentario que se mezcle con los de los demás para no levantar sospechas.

3.  **Fase de Votación:** Se revelan todos los comentarios a los jugadores. A continuación, los jugadores debaten y votan por la persona que creen que es el impostor.

4.  **Fase de Resultado:** El jugador con más votos es eliminado del juego. A continuación, se revela si el jugador eliminado era el impostor o no.

5.  **Fin del Juego:** El juego termina cuando se cumple una de las siguientes condiciones:
    *   Los jugadores ganan al eliminar al impostor.
    *   El impostor gana al eliminar a suficientes jugadores.

## Características

*   **Multijugador en Tiempo Real:** Participa en emocionantes partidas en tiempo real con amigos.
*   **Sistema de Salas:** Crea o únete a salas de juego para jugar.
*   **Juego por Fases:** El juego progresa a través de fases estructuradas, desde la sala de espera hasta el resultado final.
*   **Deducción Social:** Pon a prueba tu intuición y tus habilidades de engaño.

## Tecnologías Utilizadas

*   **Frontend:** React
*   **Comunicación en Tiempo Real:** [Socket.IO Client](https://socket.io/docs/v4/client-api/)

**Nota:** Este repositorio contiene únicamente el cliente del frontend. Se necesita un servidor de backend que implemente la lógica del juego y gestione los eventos de Socket.IO para poder jugar.

## Cómo Empezar

Para ejecutar este proyecto localmente, sigue estos pasos:

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/tu-repositorio.git
    cd tu-repositorio
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecuta la aplicación:**
    ```bash
    npm start
    ```
    La aplicación estará disponible en `http://localhost:3000`.

4.  **Ejecuta las pruebas:**
    ```bash
    npm test
    ```
    Esto ejecutará las pruebas en modo interactivo.
