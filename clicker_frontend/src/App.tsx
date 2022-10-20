import type {Component} from 'solid-js';
import {createSignal} from "solid-js";
import styles from './App.module.css';
import {ServerMessages, ClientMessages} from "./game_messages";

const App: Component = () => {

    const [ore, setOre] = createSignal(0);
    const [depth, setDepth] = createSignal(0);
    const [shovel, setShovel] = createSignal(0);

    let socket: WebSocket | undefined;
    const s = new WebSocket("ws://localhost:3001/game");
    const connectBackend = async () => {


        socket = s;
    }

    const disconnectBackend = () => {
        if (socket != null) {
            socket.close();
        }
    }

    const click = async () => {
        if (socket){
            const event: ClientMessages = "Mine";
            await socket.send(JSON.stringify(event));

            s.onmessage = msg => {
                const event: ServerMessages = JSON.parse(msg.data as string);
                if ("NewState" in event) {
                    console.log(event.NewState);
                    setOre(event.NewState.ore);
                    setDepth(event.NewState.depth);
                }
                else if ("ShovelLevel"in event){
                    console.log(event.ShovelLevel);
                    setShovel(event.ShovelLevel.level);
                }
            }
        }
    }
    const upgradeShovel = async () => {
        if (socket){
            const event: ClientMessages = "UpgradeShovel";
            await socket.send(JSON.stringify(event));

        }

    }
    const login = async () => {
        let auth = btoa(`${username_field.value}:${password_field.value}`);
        const response = await fetch("http://localhost:3001/login", {
            method: "GET",
            credentials: "include",
            headers: {"Authorization": `Basic ${auth}`}
        });
        console.log(`login: ${response.statusText}`);
        if (response.ok) {
            //Pop Up schließen?
        }
    }

    return (
        <div class={styles.App}>
            <header class={styles.header}>
                <button class={styles.button} onClick={connectBackend}>Connect</button>
                <button class={styles.button} onClick={disconnectBackend}>Disconnect</button>
                <br/>
                <button class={styles.button} onClick={click}>Login</button>
                <button class={styles.button} onClick={click}>Mine Ore</button>
                <br/>
                <button class={styles.button} onClick={upgradeShovel}>Schaufelgeschwindigkeitslevel: {shovel()} </button>
                <label>{ore()}</label>
                <label>Grabtiefe: {depth()}</label>
            </header>
        </div>
    );
};

export default App;
