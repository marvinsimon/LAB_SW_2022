import type {Component} from "solid-js";
import {createSignal, onCleanup, Show} from "solid-js";
import styles from "./App.module.css";
import pvpModule from "./styles/PvP.module.css";
import mineModule from "./styles/Mining.module.css";
import {ClientMessages, ServerMessages} from "./game_messages";
import clicker_logo from "./assets/ClickerRoyale_Wappen.png";
import board from "./assets/Brettmiticon.png";
import board_right from "./assets/Brett2.png";
import game from "./assets/Playground.png";
import {Portal} from "solid-js/web";
import {TestCaseHookDefinition} from "@cucumber/cucumber";

const App: Component = () => {

    let password_field: HTMLInputElement;
    let email_field: HTMLInputElement;

    const [ore, setOre] = createSignal(0);
    const [auth, setAuth] = createSignal(false);
    const [depth, setDepth] = createSignal(0);
    //PopUp Variable
    const [show, setShow] = createSignal(false);
    const [innershow, setInnerShow] = createSignal(false);
    const [shovelDepth, setShovelDepth] = createSignal(1);
    const [shovelAmount, setShovelAmount] = createSignal(1);
    const [automation_on, setAutomation] = createSignal(false);
    const [autoDepth, setAutoDepth] = createSignal(1);
    const [autoAmount, setAutoAmount] = createSignal(1);
    const [loggedIn, setLoggedIn] = createSignal(false);
    const [bad_request_bool, setBad_request_bool] = createSignal(false);
    const [unauthorized, setUnauthorized] = createSignal(false);
    const [showMining, setShowMining] = createSignal(false);
    const [showPVP, setShowPVP] = createSignal(false);
    const [popup, setPopup] = createSignal(false);


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
            await connectBackend();
        } else if (response.status == 400) {
            setBad_request_bool(true);
            console.log('Bad Request');
        }
    }

    const login = async () => {
        if (!auth()) {
            disconnectBackend();
            setUnauthorized(false);
            let auth = btoa(`${email_field.value}:${password_field.value}`);
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
                await connectBackend();
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

    const hide = () => {
        document.querySelectorAll("." + styles.buttonitem).forEach(value => value.classList.add(pvpModule.hide));
    }

    const unhide = () => {
        document.querySelectorAll("." + styles.buttonitem).forEach(value => value.classList.remove(pvpModule.hide));
    }

    return (

        <div class={styles.App}>
            <div class={styles.container}>
                <div class={styles.header}>
                    <img src={clicker_logo} class={styles.header_logo} alt={"ClickerRoyale Logo"}/>
                    <nav>
                        <Show when={!loggedIn()}
                              fallback={<button class={styles.button} onClick={() => {
                                  sign_out();
                                  setShow(false);
                                  setInnerShow(false)
                              }}>Ausloggen</button>}>
                            <button onClick={(e) => setShow(true)} class={styles.button_sign_up}></button>
                            <Show when={show()}
                                  fallback={""}>
                                <div class={styles.modal} use:clickOutside={() => setShow(false)}>
                                    <h3>SignUp</h3>
                                    <input type="text" ref={email_field!} style="width: 300px;"
                                           placeholder="Ihre E-mail.."/>
                                    <input type="password" ref={password_field!} style="width: 300px;"
                                           placeholder="Ihr Passwort.."/>
                                    <input type="submit" value="Sign Up" onClick={sign_up}/>
                                    <div class={styles.switch}>
                                        <p>Already signed up?</p>
                                        <button class={styles.buttonswitch} onClick={() => {
                                            setShow(false);
                                            setInnerShow(true)
                                        }}>Login
                                        </button>
                                    </div>
                                </div>
                            </Show>
                            <Show when={innershow()}
                                  fallback={""}>
                                <div class={styles.modal} use:clickOutside={() => setInnerShow(false)}>
                                    <h3>Login</h3>
                                    <input type="text" ref={email_field!} style="width: 300px;"
                                           placeholder="Ihre E-mail.."/>
                                    <input type="password" ref={password_field!} style="width: 300px;"
                                           placeholder="Ihr Passwort.."/>
                                    <input type="submit" value="Log In" onClick={login}/>
                                    <div class={styles.switch}>
                                        <p>Not registered?</p>
                                        <button class={styles.buttonswitch} onClick={() => {
                                            setShow(true);
                                            setInnerShow(false)
                                        }}>Sign Up
                                        </button>
                                    </div>
                                </div>
                            </Show>
                        </Show>
                    </nav>
                </div>
                <div class={styles.board}>
                    <div class={styles.parent}>
                    <img src={board} class={styles.board_img} alt={"Value board"}/>
                            <div class={styles.label_ore}>
                                <label>{ore()}</label>
                            </div>
                            <div class={styles.label_depth}>
                                <label>{depth()}</label>
                            </div>
                            <div class={styles.label_diamond}>
                                <label>coming soon</label>
                            </div>
                    </div>
                </div>
                <div class={styles.main} onClick={mine}>
                    <img src={game} class={styles.game} alt={"Game ground"}/>
                </div>
                <div class={styles.controls}>
                    <Show when={showPVP()}
                          fallback={
                              <>
                                  <div class={styles.buttonitem}>
                                      <button onClick={(e) => {
                                          setShowPVP(true);
                                          hide()
                                      }} class={pvpModule.button_pvp}></button>
                                  </div>
                              </>
                          }>
                        <div class={styles.slideIn}>
                            <img src={board_right} class={styles.board_img_right} alt={"Control board"}/>
                            <button class={styles.button_close} onClick={() => {
                                setShowPVP(false);
                                unhide()
                            }}>X
                            </button>
                            <label class={pvpModule.label_pvp}>PvP</label>
                            <br/>
                            <button class={pvpModule.button_upgrade_attack}>Angriff verbessern</button>
                            <button class={pvpModule.button_upgrade_defence}>Verteidigung verbessern</button>
                            <button class={pvpModule.button_pvp_attack}></button>
                        </div>
                    </Show>

                    <Show when={showMining()}
                          fallback={
                              <>
                                  <div class={styles.buttonitem}>
                                      <button onClick={(e) => {
                                          setShowMining(true);
                                          hide()
                                      }} class={mineModule.button_mine}></button>
                                  </div>
                              </>
                          }>
                        <div class={styles.slideIn}>
                            <img src={board_right} class={styles.board_img_right} alt={"Control board"}/>
                            <button class={styles.button_close} onClick={() => {
                                setShowMining(false);
                                unhide()
                            }}>X
                            </button>
                            <label class={mineModule.label_mine}>Mining</label>
                            <br/>
                            <button class={mineModule.button_upgrade_speed}
                                    onClick={upgradeShovelDepth}>Schaufelgeschwindigkeitslevel: {shovelDepth()} </button>
                            <button class={mineModule.button_upgrade_amount}
                                    onClick={upgradeShovelAmount}>Schaufelmengenlevel: {shovelAmount()} </button>
                            <Show when={automation_on()}
                                  fallback={<button class={mineModule.button_automate}
                                                    onClick={automate}>Automatisierung</button>}>
                                <button class={styles.button} onClick={upgradeAutoDepth}>Automat
                                    Tiefe: {autoDepth()}</button>
                                <br/>
                                <button class={styles.button} onClick={upgradeAutoAmount}>Automat Erz
                                    Menge: {autoAmount()}</button>
                            </Show>
                        </div>
                    </Show>
                    <div class={styles.buttonitem}>
                        <button class={styles.button_rank}></button>
                    </div>

                    <div class={styles.buttonitem}>
                        <button class={styles.button_shop}></button>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default App;
