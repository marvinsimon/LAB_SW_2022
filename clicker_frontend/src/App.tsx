import type {Component} from "solid-js";
import {createSignal, onCleanup, Show} from "solid-js";
import styles from "./App.module.css";
import {ClientMessages, ServerMessages} from "./game_messages";
import clicker_logo from "./assets/ClickerRoyale_Wappen.png";
import board from "./assets/Brettmiticon.png";
import game from "./assets/Playground.png";

const App: Component = () => {

    let password_field: HTMLInputElement;
    let email_field: HTMLInputElement;
    let login_email_field: HTMLInputElement;
    let login_password_field: HTMLInputElement;


    const [ore, setOre] = createSignal(0);
    const [auth, setAuth] = createSignal(false);
    const [depth, setDepth] = createSignal(0);
    //PopUp Variable
    const [show, setShow] = createSignal(false);
    const [shovelDepth, setShovelDepth] = createSignal(1);
    const [shovelAmount, setShovelAmount] = createSignal(1);
    const [automation_on, setAutomation] = createSignal(false);
    const [autoDepth, setAutoDepth] = createSignal(1);
    const [autoAmount, setAutoAmount] = createSignal(1);
    const [loggedIn, setLoggedIn] = createSignal(false);
    const [bad_request_bool, setBad_request_bool] = createSignal(false);
    const [unauthorized, setUnauthorized] = createSignal(false);


    let socket: WebSocket | undefined;

    const connectBackend = async () => {
        socket = new WebSocket("ws://localhost:3001/game");
        socket.onmessage = (msg) => {
            const event: ServerMessages = JSON.parse(msg.data as string);
            if ("NewState" in event) {
                console.log(event.NewState);
                setOre(event.NewState.ore);
                setDepth(event.NewState.depth);
            } else if ("ShovelDepthUpgraded" in event) {
                console.log(event.ShovelDepthUpgraded);
                setShovelDepth(event.ShovelDepthUpgraded.new_level);
            } else if ("ShovelAmountUpgraded" in event) {
                console.log(event.ShovelAmountUpgraded);
                setShovelAmount(event.ShovelAmountUpgraded.new_level);
            } else if ("AutomationDepthUpgraded" in event) {
                console.log(event.AutomationDepthUpgraded);
                setAutoDepth(event.AutomationDepthUpgraded.new_level);
            } else if ("AutomationAmountUpgraded" in event) {
                console.log(event.AutomationAmountUpgraded);
                setAutoAmount(event.AutomationAmountUpgraded.new_level);
            }
        }
    }

    const disconnectBackend = () => {
        socket?.close();
    }

    const mine = async () => {
        if (socket) {
            const event: ClientMessages = "Mine";
            await socket.send(JSON.stringify(event));
        }
    }

    const upgradeShovelAmount = async () => {
        if (socket) {
            const event: ClientMessages = "UpgradeShovelAmount";
            await socket.send(JSON.stringify(event));
        }
    }

    const upgradeShovelDepth = async () => {
        if (socket) {
            const event: ClientMessages = "UpgradeShovelDepth";
            await socket.send(JSON.stringify(event));
        }
    }

    const automate = async () => {
        if (socket) {
            setAutomation(true);
            const event: ClientMessages = "StartAutomation";
            await socket.send(JSON.stringify(event));
        }
    }

    const upgradeAutoDepth = async () => {
        if (socket) {
            const event: ClientMessages = "UpgradeAutomationDepth";
            await socket.send(JSON.stringify(event));
        }
    }

    const upgradeAutoAmount = async () => {
        if (socket) {
            const event: ClientMessages = "UpgradeAutomationAmount";
            await socket.send(JSON.stringify(event));
        }
    }

    const sign_up = async () => {
        setBad_request_bool(false);
        let auth = btoa(`${email_field.value}:${password_field.value}`);
        const response = await fetch("http://localhost:3001/sign_up", {
            method: "GET",
            credentials: "include",
            headers: {Authorization: `Basic ${auth}`},
        });
        console.log(`sign_up: ${response.statusText}`);
        if (response.ok) {
            setLoggedIn(true);
            setAuth(true);
        } else if (response.status == 400) {
            setBad_request_bool(true);
            console.log('Bad Request');
        }
    }

    const login = async () => {
        if (!auth()) {
            disconnectBackend();
            setUnauthorized(false);
            let auth = btoa(`${login_email_field.value}:${login_password_field.value}`);
            const response = await fetch("http://localhost:3001/login", {
                method: "GET",
                credentials: "include",
                headers: {Authorization: `Basic ${auth}`},
            });
            console.log(`login: ${response.statusText}`);
            if (response.ok) {
                await connectBackend();
                setLoggedIn(true);
                setAuth(true);
            } else if (response.status == 401) {
                setUnauthorized(true);
                console.log('Unauthorized');
            }
        }
    }

    const sign_out = async () => {
        if (auth()) {
            const response = await fetch("http://localhost:3001/logout", {
                method: "GET",
                credentials: "include",
            });
            console.log(`sign_out: ${response.statusText}`);
            if (response.ok) {
                disconnectBackend();
                setLoggedIn(false);
                setAuth(false);
            }
        } else {
            console.log(`sign_out: failed`);
        }
    }

    const clickOutside = async (el: { contains: (arg0: any) => any }, accessor: () => { (): any; new(): any }) => {
        const onClick = (e: MouseEvent) => !el.contains(e.target) && accessor()?.();
        document.body.addEventListener("click", onClick);
        onCleanup(() => document.body.removeEventListener("click", onClick));
    }

    return (
        <div class={styles.App}>
            <header class={styles.header}>
                <div class={styles.nav}>
                    <div class={styles.container}>
                        <div class={styles.flex}>
                            <div class={styles.logocont}>
                                <img src={clicker_logo} alt={"ClickerRoyale Logo"}/>
                            </div>
                            <nav>
                                <Show
                                    when={show()}
                                    fallback={<button onClick={(e) => setShow(true)} class={styles.signupbutton}></button>}>
                                    <div class={styles.modal} use:clickOutside={() => setShow(false)}>
                                        <h3>Anmelden</h3>
                                        <label>E-mail</label>
                                        <input type="text" ref={email_field!} style="width: 300px;" placeholder="Ihre E-mail.."/>
                                        <label>Passwort</label>
                                        <input type="password" ref={password_field!} style="width: 300px;"
                                               placeholder="Ihr Passwort.."/>
                                        <br/>
                                        <input type="submit" value="Anmelden" onClick={sign_up}/>
                                        <br/>
                                        <Show when={bad_request_bool()}>
                                            <div class={styles.fadeout}>
                                                <label>Diese E-Mail existiert schon</label>
                                            </div>
                                        </Show>
                                    </div>
                                </Show>
                            </nav>
                        </div>
                    </div>
                </div>

                <div class={styles.gamecontainer}>
                    <div class={styles.board}>
                        <img src={board} alt={"Information board"}/>
                        <label>{ore()}</label>
                        <label>{depth()}</label>
                        <label>{ore()}</label>
                    </div>
                    <div class={styles.game}>
                        <img src={game} alt={"Game"}/>
                    </div>
                    <div class={styles.controls}>
                        <p>Test</p>
                    </div>
                </div>

                <br/>
                <button class={styles.button} onClick={connectBackend}>Connect</button>
                <button class={styles.button} onClick={disconnectBackend}>Disconnect</button>
                <br/>
                <button class={styles.button} onClick={mine}>Erze schürfen</button>
                <br/>
                <button class={styles.button}
                        onClick={upgradeShovelDepth}>Schaufelgeschwindigkeitslevel: {shovelDepth()} </button>
                <br/>
                <button class={styles.button}
                        onClick={upgradeShovelAmount}>Schaufelmengenlevel: {shovelAmount()} </button>
                <br/>
                <Show when={automation_on()}
                      fallback={<button class={styles.button} onClick={automate}>Automatisierung</button>}>
                    <button class={styles.button} onClick={upgradeAutoDepth}>Automat Tiefe: {autoDepth()}</button>
                    <br/>
                    <button class={styles.button} onClick={upgradeAutoAmount}>Automat Erz Menge: {autoAmount()}</button>
                </Show>
                <br/>
                <br/>
                <Show when={!loggedIn()} fallback={<button class={styles.button} onClick={sign_out}>Ausloggen</button>}>
                    <input type="text" ref={login_email_field!} style="width: 300px;" placeholder="Ihre E-mail.."/>
                    <input type="password" ref={login_password_field!} style="width: 300px;"
                           placeholder="Ihr Passwort.."/>
                    <button class={styles.button} onClick={login}>Einloggen</button>
                    <Show when={unauthorized()}>
                        <div class={styles.fadeout}>
                            <label>Invalide E-Mail oder Passwort</label>
                        </div>
                    </Show>
                    <br/>

                </Show>




            </header>
        </div>
    );
};

export default App;
