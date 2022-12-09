import type {Component} from "solid-js";
import {createSignal, onCleanup, Show} from "solid-js";
import styles from "./App.module.css";
import pvpModule from "./styles/PvP.module.css";
import mineModule from "./styles/Mining.module.css";
import displayModule from "./styles/Display.module.css";
import {ClientMessages, ServerMessages} from "./game_messages";
import clicker_logo from "./assets/ClickerRoyale_Wappen.png";
import board from "./assets/Brettmiticon.png";
import board_right from "./assets/Brett2.png";
import small_board from "./assets/small_brett.png";
import game from "./assets/Playground.png";

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
    const [pvp, setPvp] = createSignal(false);
    const [attackLevel, setAttackLevel] = createSignal(1);
    const [defenceLevel, setDefenceLevel] = createSignal(1);
    const [loggedIn, setLoggedIn] = createSignal(false);
    const [bad_request_bool, setBad_request_bool] = createSignal(false);
    const [unauthorized, setUnauthorized] = createSignal(false);
    const [showMining, setShowMining] = createSignal(false);
    const [showPVP, setShowPVP] = createSignal(false);
    const [popup, setPopup] = createSignal(false);
    const [showLoot, setShowLoot] = createSignal(false);
    const [loot, setLoot] = createSignal(0);
    const [attacked, setAttacked] = createSignal(false);
    const [showOfflineResources, setShowOfflineResources] = createSignal(false);
    const [totalDepth, setTotalDepth] = createSignal(0);
    const [totalAmount, setTotalAmount] = createSignal(0);

    let socket: WebSocket | undefined;

    const connectBackend = async () => {
        if (socket != null)
            disconnectBackend();
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
            } else if ("AttackLevelUpgraded" in event) {
                console.log(event.AttackLevelUpgraded);
                setAttackLevel(event.AttackLevelUpgraded.new_level);
            } else if ("DefenceLevelUpgraded" in event) {
                console.log(event.DefenceLevelUpgraded);
                setDefenceLevel(event.DefenceLevelUpgraded.new_level);
            } else if ("LoginState" in event) {
                console.log(event.LoginState);
                setLoginStates(event.LoginState);
            } else if ("CombatElapsed" in event) {
                console.log(event.CombatElapsed);
                lootArrived(event.CombatElapsed);
            } else if ("LoggedIn" in event) {
                console.log("Still logged in")
                setAuth(true);
                setLoggedIn(true);
            } else if ("AutomationStarted" in event) {
                setAutomation(event.AutomationStarted.success);
            } else if ("MinedOffline" in event) {
                console.log("Got offline resources")
                setTotalDepth(event.MinedOffline.depth);
                setTotalAmount(event.MinedOffline.ore);

                setShowOfflineResources(true);
            }
        }
        socket.onopen = () => {
            const event: ClientMessages = "GetLoginData";
            socket?.send(JSON.stringify(event));
        }
    }

    window.onload = async () => {
        await connectBackend();
    }

    function lootArrived(CombatElapsed: { loot: number }) {
        setShowLoot(true);
        setLoot(CombatElapsed.loot);
    }

    const setLoginStates = (LoginState: { shovel_amount: number; shovel_depth: number; automation_depth: number; automation_amount: number; attack_level: number; defence_level: number; automation_started: boolean }) => {
        setShovelDepth(LoginState.shovel_depth);
        setShovelAmount(LoginState.shovel_amount);
        setAutoAmount(LoginState.automation_amount);
        setAutoDepth(LoginState.automation_depth);
        setAutomation(LoginState.automation_started);
        setAttackLevel(LoginState.attack_level);
        setDefenceLevel(LoginState.defence_level);
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

    const upgradeAttackLevel = async () => {
        if (socket) {
            const event: ClientMessages = "UpgradeAttackLevel";
            await socket.send(JSON.stringify(event));
        }
    }

    const upgradeDefenceLevel = async () => {
        if (socket) {
            const event: ClientMessages = "UpgradeDefenceLevel";
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
        document.querySelectorAll("." + styles.buttonitem).forEach(value => value.classList.add(styles.hide));
    }

    const unHide = () => {
        document.querySelectorAll("." + styles.buttonitem).forEach(value => value.classList.remove(styles.hide));
    }

    const slideOut = () => {
        let variable = document.querySelector("." + styles.slideIn);
        variable!.classList.remove(styles.slideIn);
        variable!.classList.add(styles.slideOut);
    }

    const slideOutAutomate = () => {
        let variable = document.querySelector("." + styles.slideIn_automate);
        variable!.classList.remove(styles.slideIn_automate);
        variable!.classList.add(styles.slideOut_automate);
    }

    const rotateClockwise = () => {
        let left = document.querySelector("." + styles.gear_left);
        left!.classList.remove(styles.gear_rotate_counterClockwise);
        left!.classList.add(styles.gear_rotate_clockwise);

        let right = document.querySelector("." + styles.gear_right);
        right!.classList.remove(styles.gear_rotate_clockwise);
        right!.classList.add(styles.gear_rotate_counterClockwise);
    }

    const rotateCounterClockwise = () => {
        let left = document.querySelector("." + styles.gear_left);
        left!.classList.remove(styles.gear_rotate_clockwise);
        left!.classList.add(styles.gear_rotate_counterClockwise);

        let right = document.querySelector("." + styles.gear_right);
        right!.classList.remove(styles.gear_rotate_counterClockwise);
        right!.classList.add(styles.gear_rotate_clockwise);
    }
    const startTimer = async () => {
        let reverse_counter = 9;
        const combatTimer = setInterval(function () {
            document.querySelector<HTMLProgressElement>("#progressBar")!.value = 9 - --reverse_counter;
            if (reverse_counter <= 0)
                clearInterval(combatTimer);
            setAttacked(false);
        }, 1000);
    }

    const attack = async () => {
        const response = await fetch("http://localhost:3001/combat", {
            method: "GET",
            credentials: "include",
        });
        if (response.status == 200) { //200 == StatusCode OK
            setAttacked(true);
            console.log("Start timer");
            //Start timer
            await startTimer();
        } else if (response.status == 204) { //204 == StatusCode NO_CONTENT
            console.log("No match");
        }
    }

    return (
        <div class={styles.App}>
            <div class={styles.container}>
                <div class={styles.header}>
                    <img src={clicker_logo} class={styles.header_logo} alt={"ClickerRoyale Logo"}/>
                    <Show when={!loggedIn()}
                          fallback={<button class={styles.User_symbol} onClick={() => {
                              sign_out();
                              setShow(false);
                              setInnerShow(false)
                          }}>Ausloggen</button>}>
                        <button onClick={(e) => setShow(true)} class={styles.button_sign_up}>Login</button>
                        <Show when={show()}
                              fallback={""}>
                            <div class={styles.modal} use:clickOutside={() => setShow(false)}>
                                <h3>Login</h3>
                                <input type="text" ref={email_field!} style="width: 300px;"
                                       placeholder="email or username.."/>
                                <input type="password" ref={password_field!} style="width: 300px;"
                                       placeholder="password.."/>
                                <input type="submit" value="Log In" onClick={login}/>
                                <div class={styles.switch}>
                                    <p>Not registered?</p>
                                </div>
                                <div class={styles.switch}>
                                    <button class={styles.buttonswitch} onClick={() => {
                                        setShow(false);
                                        setInnerShow(true)
                                    }}>Sign Up
                                    </button>
                            </div>
                            </div>
                        </Show>

                        <Show when={innershow()}
                              fallback={""}>
                            <div class={styles.modal} use:clickOutside={() => setInnerShow(false)}>
                                <h3>Sign Up</h3>
                                <input type="text" ref={email_field!} style="width: 300px;"
                                       placeholder="email.."/>
                                <input type="password" ref={password_field!} style="width: 300px;"
                                       placeholder="password.."/>
                                <input type="submit" value="Sign Up" onClick={sign_up}/>
                                <div class={styles.switch}>
                                    <p>Already signed up?</p>
                                </div>
                                <div class={styles.switch}>
                                    <button class={styles.buttonswitch} onClick={() => {
                                        setShow(true);
                                        setInnerShow(false)
                                    }}>Login
                                    </button>
                                </div>
                            </div>
                        </Show>
                    </Show>
                </div>
                <div class={styles.board}>
                    <div class={styles.val_board}>
                        <div class={styles.board_img_container}>
                            <img src={board} class={styles.board_img} alt={"Value board"}/>
                            <div class={styles.label_header + " " + displayModule.label_ore}>
                                <label>{ore()}</label>
                            </div>
                            <div class={styles.label_header + " " + displayModule.label_depth}>
                                <label>{depth()}</label>
                            </div>
                            <div class={styles.label_header + " " + displayModule.label_diamond}>
                                <label>soon</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class={styles.main} onClick={mine}>
                    <img src={game} class={styles.game} alt={"Game ground"}/>
                </div>
                <div class={styles.controls}>
                    <a class={styles.gear_normal + " " + styles.gear_left}/>
                    <a class={styles.gear_normal + " " + styles.gear_right}></a>
                    <Show when={showPVP()}
                          fallback={
                              <>
                                  <div class={styles.buttonitem}>
                                      <button onClick={(e) => {
                                          setShowPVP(true);
                                          hide();
                                          rotateClockwise();
                                      }} class={styles.button}>PVP
                                      </button>
                                  </div>
                              </>
                          }>
                        <div class={styles.slideIn}>
                            <div class={styles.image_container}>
                                <img src={board_right} class={styles.board_img_right} alt={"Control board"}/>
                                <button class={styles.button_close} onClick={() => {
                                    slideOut();
                                    window.setTimeout(function () {
                                        setShowPVP(false);
                                        unHide();
                                    }, 1300);
                                    rotateCounterClockwise();
                                }}>
                                    <label class={styles.label_header + " " + styles.label_close}>X</label>
                                </button>
                                <a class={styles.label_board}>
                                    <label class={styles.label_header + " " + pvpModule.label_pvp}>PvP</label>
                                </a>
                                <button class={styles.button + " " + pvpModule.upgrade_attack}
                                        onClick={upgradeAttackLevel}>ANG
                                </button>
                                <a class={styles.icon_upgrade + " " + pvpModule.icon_upgrade_attack}></a>
                                <label
                                    class={styles.label_header + " " + pvpModule.label_attack_level}>{attackLevel()}</label>

                                <button class={styles.button + " " + pvpModule.upgrade_defence}
                                        onClick={upgradeDefenceLevel}>DEF
                                </button>
                                <a class={styles.icon_upgrade + " " + pvpModule.icon_upgrade_defence}></a>
                                <label
                                    class={styles.label_header + " " + pvpModule.label_defence_level}>{defenceLevel()}</label>

                                <Show when={attacked()}
                                      fallback={<button class={styles.button + " " + pvpModule.pvp_attack}
                                                        onClick={attack}></button>}>
                                    <progress value={"0"} max={"9"} id="progressBar" class={styles.progressBar}
                                              onClick={() => {
                                                  attack();
                                                  setAttacked(false)
                                              }}></progress>
                                </Show>
                            </div>
                        </div>
                    </Show>

                    <Show when={showMining()}
                          fallback={
                              <>
                                  <div class={styles.buttonitem}>
                                      <button onClick={(e) => {
                                          setShowMining(true);
                                          hide();
                                          rotateClockwise();
                                          console.log("Automation: " + automation_on());
                                      }} class={styles.button}>Mining
                                      </button>
                                  </div>
                              </>
                          }>
                        <div class={styles.slideIn}>
                            <img src={board_right} class={styles.board_img_right} alt={"Control board"}/>
                            <button class={styles.button_close} onClick={() => {
                                if (automation_on()) {
                                    slideOutAutomate();
                                }
                                slideOut();
                                window.setTimeout(function () {
                                    setShowMining(false);
                                    unHide();
                                }, 1300);
                                rotateCounterClockwise();
                            }}>
                                <label class={styles.label_header + " " + styles.label_close}>X</label>
                            </button>
                            <a class={styles.label_board}>
                                <label class={styles.label_header + " " + mineModule.label_mine}>Mining</label>
                            </a>
                            <button class={styles.button + " " + mineModule.upgrade_speed}
                                    onClick={upgradeShovelDepth}>Depth
                            </button>
                            <a class={styles.icon_upgrade + " " + mineModule.icon_upgrade_speed}></a>
                            <label
                                class={styles.label_header + " " + mineModule.label_speed_level}>{shovelDepth()}</label>

                            <button class={styles.button + " " + mineModule.upgrade_amount}
                                    onClick={upgradeShovelAmount}>Amount
                            </button>
                            <a class={styles.icon_upgrade + " " + mineModule.icon_upgrade_amount}></a>
                            <label
                                class={styles.label_header + " " + mineModule.label_amount_level}>{shovelAmount()}</label>

                            <Show when={automation_on()}
                                  fallback={<button class={styles.button + " " + mineModule.automate}
                                                    onClick={automate}>Automate</button>}>
                                <label class={styles.label_header + " " + mineModule.label_automate}>Automate On</label>
                                <div class={styles.slideIn_automate}>
                                    <div class={styles.image_container_automate}>
                                        <img src={small_board} class={styles.board_img_automate} alt={"Automate Board"}/>
                                        <button class={styles.button + " " + mineModule.upgrade_automate_speed} onClick={upgradeAutoDepth}>Depth</button>
                                        <a class={styles.icon_upgrade + " " + mineModule.icon_upgrade_automate_speed}></a>
                                        <label
                                            class={styles.label_header + " " + mineModule.label_speed_automate_level}>{autoDepth()}</label>

                                        <button class={styles.button + " " + mineModule.upgrade_automate_amount} onClick={upgradeAutoAmount}>Amount</button>
                                        <a class={styles.icon_upgrade + " " + mineModule.icon_upgrade_automate_amount}></a>
                                        <label
                                            class={styles.label_header + " " + mineModule.label_amount_automate_level}>{autoAmount()}</label>
                                    </div>
                                </div>
                            </Show>
                        </div>
                    </Show>
                    <div class={styles.buttonitem}>
                        <button class={styles.button}>Rank</button>
                    </div>
                    <div class={styles.buttonitem}>
                        <button class={styles.button}>Shop</button>
                    </div>

                    <Show when={showLoot()}>
                        <div class={styles.modal} use:clickOutside={() => setShowLoot(false)}>
                            <label> Der Angriff war erfolgreich! </label>
                            <label> Deine Beute: {loot()} Erz</label>
                        </div>
                    </Show>

                    <Show when={showOfflineResources()} >
                        <div class={styles.modal} use:clickOutside={() => setShowOfflineResources(false)}>
                            <label> Willkommen zurück! </label>
                            <label> Abgebautes Erz: {totalAmount()}</label>
                            <label> Zurückgelegte Grabtiefe: {totalDepth()}</label>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    )
        ;
};

export default App;
