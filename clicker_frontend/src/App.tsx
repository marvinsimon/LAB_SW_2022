import type {Component} from "solid-js";
import {createSignal, onCleanup, Show} from "solid-js";
import styles from "./App.module.css";
import pvpModule from "./styles/PvP.module.css";
import mineModule from "./styles/Mining.module.css";
import displayModule from "./styles/Display.module.css";
import {ClientMessages, ServerMessages} from "./game_messages";
import clicker_logo from "./assets/img/ClickerRoyale_Wappen.png";
import board from "./assets/img/Brettmiticon.png";
import board_right from "./assets/img/Brett2.png";
import small_board from "./assets/img/small_brett.png";
import buttonSound from "./assets/audio/button_click.mp3";

import ClickerRoyaleGame from "./ClickerRoyaleGame";
import Phaser from "phaser";
import Preload from "./scenes/preload";
import Play from "./scenes/play";

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
    const [attackLevel, setAttackLevel] = createSignal(1);
    const [defenceLevel, setDefenceLevel] = createSignal(1);
    const [loggedIn, setLoggedIn] = createSignal(false);
    const [showMining, setShowMining] = createSignal(false);
    const [showPVP, setShowPVP] = createSignal(false);
    const [showLoot, setShowLoot] = createSignal(false);
    const [loot, setLoot] = createSignal(0);
    const [attacked, setAttacked] = createSignal(false);
    const [showOfflineResources, setShowOfflineResources] = createSignal(false);
    const [totalDepth, setTotalDepth] = createSignal(0);
    const [totalAmount, setTotalAmount] = createSignal(0);
    const [attackPrice, setAttackPrice] = createSignal(50);
    const [defencePrice, setDefencePrice] = createSignal(50);
    const [shovelDepthPrice, setShovelDepthPrice] = createSignal(50);
    const [shovelAmountPrice, setShovelAmountPrice] = createSignal(50);
    const [autoDepthPrice, setAutoDepthPrice] = createSignal(50);
    const [autoAmountPrice, setAutoAmountPrice] = createSignal(50);
    const [costNumber, setCostNumber] = createSignal("");
    const [diamond, setDiamond] = createSignal(0);

    let game: ClickerRoyaleGame;
    let socket: WebSocket | undefined;

    const connectBackend = async () => {
        if (socket != null)
            disconnectBackend();
        socket = new WebSocket("ws://localhost:3001/game");
        socket.onmessage = (msg) => {
            const event: ServerMessages = JSON.parse(msg.data as string);
            if (typeof event === 'object') {
                if ("NewState" in event) {
                    console.log(event.NewState);
                    setOre(event.NewState.ore);
                    setDepth(event.NewState.depth);
                    game.depth = depth();
                } else if ("ShovelDepthUpgraded" in event) {
                    console.log(event.ShovelDepthUpgraded);
                    setShovelDepth(event.ShovelDepthUpgraded.new_level);
                    if (event.ShovelDepthUpgraded.success) {
                        subtractCost(formatNumbers(shovelDepthPrice()));
                    }
                    setShovelDepthPrice(event.ShovelDepthUpgraded.new_upgrade_cost);
                } else if ("ShovelAmountUpgraded" in event) {
                    console.log(event.ShovelAmountUpgraded);
                    setShovelAmount(event.ShovelAmountUpgraded.new_level);
                    if (event.ShovelAmountUpgraded.success) {
                        subtractCost(formatNumbers(shovelAmountPrice()));
                    }
                    setShovelAmountPrice(event.ShovelAmountUpgraded.new_upgrade_cost);
                } else if ("AutomationDepthUpgraded" in event) {
                    console.log(event.AutomationDepthUpgraded);
                    setAutoDepth(event.AutomationDepthUpgraded.new_level);
                    if (event.AutomationDepthUpgraded.success) {
                        subtractCost(formatNumbers(autoDepthPrice()));
                    }
                    setAutoDepthPrice(event.AutomationDepthUpgraded.new_upgrade_cost);
                } else if ("AutomationAmountUpgraded" in event) {
                    console.log(event.AutomationAmountUpgraded);
                    setAutoAmount(event.AutomationAmountUpgraded.new_level);
                    if (event.AutomationAmountUpgraded.success) {
                        subtractCost(formatNumbers(autoAmountPrice()));
                    }
                    setAutoAmountPrice(event.AutomationAmountUpgraded.new_upgrade_cost);
                } else if ("AttackLevelUpgraded" in event) {
                    console.log(event.AttackLevelUpgraded);
                    setAttackLevel(event.AttackLevelUpgraded.new_level);
                    if (event.AttackLevelUpgraded.success) {
                        subtractCost(formatNumbers(attackPrice()));
                    }
                    setAttackPrice(event.AttackLevelUpgraded.new_upgrade_cost);
                } else if ("DefenceLevelUpgraded" in event) {
                    console.log(event.DefenceLevelUpgraded);
                    setDefenceLevel(event.DefenceLevelUpgraded.new_level);
                    if (event.DefenceLevelUpgraded.success) {
                        subtractCost(formatNumbers(defencePrice()));
                    }
                    setDefencePrice(event.DefenceLevelUpgraded.new_upgrade_cost);
                } else if ("LoginState" in event) {
                    console.log(event.LoginState);
                    setLoginStates(event.LoginState);
                } else if ("CombatElapsed" in event) {
                    console.log(event.CombatElapsed);
                    lootArrived(event.CombatElapsed);
                } else if ("LoggedIn" in event) {
                    console.log("Still logged in");
                    setAuth(true);
                    setLoggedIn(true);
                } else if ("AutomationStarted" in event) {
                    setAutomation(event.AutomationStarted.success);
                    if (event.AutomationStarted.success) {
                        subtractCost("200");
                    }
                } else if ("MinedOffline" in event) {
                    console.log("Got offline resources");
                    setTotalDepth(event.MinedOffline.depth);
                    setTotalAmount(event.MinedOffline.ore);
                    setShowOfflineResources(true);
                } else if ('TreasureFound' in event) {
                    console.log('Treasure found');
                    setOre(event.TreasureFound.ore);
                } else if ('DiamondFound' in event) {
                    console.log('Diamond found');
                    setDiamond(event.DiamondFound.diamond);
                } else if ('GameData' in event) {
                    console.log('Load game data');
                    loadGameData(event.GameData.picked_first_diamond);
                }
            }
        }
        socket.onopen = () => {
            const event: ClientMessages = "GetLoginData";
            window.setTimeout(() => {
                socket?.send(JSON.stringify(event));

            }, 1000);
        }
    }


    // @ts-ignore
    window.onload = async () => {
        await connectBackend();
        setupPhaserGame();
    }

    function setupPhaserGame() {
        // Scenes
        let scenes = [];

        scenes.push(Preload);
        scenes.push(Play);

        // Game config
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            //@ts-ignore
            parent: document.getElementById('main'),
            title: 'Clicker Royale',
            url: 'http://localhost:3000',
            width: 1000,
            height: 830,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: {y: 2000}
                }
            },
            scene: scenes,
            pixelArt: true,
            backgroundColor: 0x000000
        };

        // Create game app
        game = new ClickerRoyaleGame(config)
        // Globals
        game.CONFIG = {
            width: config.width,
            height: config.height,
            // @ts-ignore
            centerX: Math.round(0.5 * config.width),
            // @ts-ignore
            centerY: Math.round(0.5 * config.height),
            tile: 64,
        }

        // Sound
        game.sound_on = true;

        // Game Data
        game.tileName = "";
        game.crackedTileName = "";
        game.backgroundTileName = "";
        game.pickedFirstDiamond = false;
        game.barRowCounter = 0;

        Play.setGameInstance(game);
    }

    window.setInterval(function () {
        let upgrade_attack_icon = document.querySelector("." + pvpModule.icon_upgrade_attack);
        let upgrade_defence_icon = document.querySelector("." + pvpModule.icon_upgrade_defence);
        let upgrade_shovel_depth_icon = document.querySelector("." + mineModule.icon_upgrade_speed);
        let upgrade_shovel_amount_icon = document.querySelector("." + mineModule.icon_upgrade_amount);
        let upgrade_auto_depth_icon = document.querySelector("." + mineModule.icon_upgrade_automate_speed);
        let upgrade_auto_amount_icon = document.querySelector("." + mineModule.icon_upgrade_automate_amount);
        let automate = document.querySelector("." + mineModule.icon_automate);
        if (upgrade_attack_icon != null) {
            if (ore() >= attackPrice()) {
                upgrade_attack_icon!.classList.remove(styles.hide);
            } else {
                upgrade_attack_icon!.classList.add(styles.hide);
            }
        }
        if (upgrade_defence_icon != null) {
            if (ore() >= defencePrice()) {
                upgrade_defence_icon!.classList.remove(styles.hide);
            } else {
                upgrade_defence_icon!.classList.add(styles.hide);
            }
        }
        if (upgrade_shovel_depth_icon != null) {
            if (ore() >= shovelDepthPrice()) {
                upgrade_shovel_depth_icon!.classList.remove(styles.hide);
            } else {
                upgrade_shovel_depth_icon!.classList.add(styles.hide);
            }
        }
        if (upgrade_shovel_amount_icon != null) {
            if (ore() >= shovelAmountPrice()) {
                upgrade_shovel_amount_icon!.classList.remove(styles.hide);
            } else {
                upgrade_shovel_amount_icon!.classList.add(styles.hide);
            }
        }
        if (upgrade_auto_depth_icon != null) {
            if (ore() >= autoDepthPrice()) {
                upgrade_auto_depth_icon!.classList.remove(styles.hide);
            } else {
                upgrade_auto_depth_icon!.classList.add(styles.hide);
            }
        }
        if (upgrade_auto_amount_icon != null) {
            if (ore() >= autoAmountPrice()) {
                upgrade_auto_amount_icon!.classList.remove(styles.hide);
            } else {
                upgrade_auto_amount_icon!.classList.add(styles.hide);
            }
        }
        if (automate != null) {
            if (ore() >= 200) {
                automate!.classList.remove(styles.hide);
            } else {
                automate!.classList.add(styles.hide);
            }
        }
    }, 30)

    function formatNumbers(formatNumber: number) {
        if (formatNumber < 1000) {
            return formatNumber.toString();
        } else {
            return Intl.NumberFormat('en-US', {
                minimumFractionDigits: 1, maximumFractionDigits: 1,
                //@ts-ignore
                notation: 'compact',
                compactDisplay: 'short'
            }).format(formatNumber);
        }
    }

    function lootArrived(CombatElapsed: { loot: number }) {
        window.setTimeout(() => {
            setShowLoot(true);
            setLoot(CombatElapsed.loot);
        }, 700)

    }

    const setLoginStates = (LoginState: { shovel_amount: number; shovel_depth: number; automation_depth: number; automation_amount: number; attack_level: number; defence_level: number; automation_started: boolean; diamond: number }) => {
        setShovelDepth(LoginState.shovel_depth);
        setShovelAmount(LoginState.shovel_amount);
        setAutoAmount(LoginState.automation_amount);
        setAutoDepth(LoginState.automation_depth);
        setAutomation(LoginState.automation_started);
        setAttackLevel(LoginState.attack_level);
        setDefenceLevel(LoginState.defence_level);
        setDiamond(LoginState.diamond);
        if (loggedIn()) {
            void loadGame();
        }
    }

    const resetScreen = () => {
        if (showMining() || showPVP()) {
            slideOutAutomate();
            slideOut();
            window.setTimeout(function () {
                setShowMining(false);
                setShowPVP(false);
                unHide();
            }, 1300);
            rotateGearOut();
        }
    }

    const disconnectBackend = () => {
        resetScreen();
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
            badStatusPopup();
            console.log('Bad Request');
        }
    }

    const login = async () => {
        if (!auth()) {
            disconnectBackend();
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
                badStatusPopup();
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
                game.events.emit('logOut');
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
        if (variable) {
            variable.classList.remove(styles.slideIn);
            variable.classList.add(styles.slideOut);
        }
    }

    const slideOutAutomate = () => {
        let variable = document.querySelector("." + styles.slideIn_automate);
        if (variable) {
            variable.classList.remove(styles.slideIn_automate);
            variable.classList.add(styles.slideOut_automate);
        }
    }

    const rotateGearIn = () => {
        let left = document.querySelector("." + styles.gear_left);
        left!.classList.remove(styles.gear_rotate_counterClockwise);
        left!.classList.add(styles.gear_rotate_clockwise);

        let right = document.querySelector("." + styles.gear_right);
        right!.classList.remove(styles.gear_rotate_clockwise);
        right!.classList.add(styles.gear_rotate_counterClockwise);
    }

    const rotateGearOut = () => {
        let left = document.querySelector("." + styles.gear_left);
        left!.classList.remove(styles.gear_rotate_clockwise);
        left!.classList.add(styles.gear_rotate_counterClockwise);

        let right = document.querySelector("." + styles.gear_right);
        right!.classList.remove(styles.gear_rotate_counterClockwise);
        right!.classList.add(styles.gear_rotate_clockwise);
    }
    const startTimer = async () => {
        let seconds: string | number = 9;
        let minutes: string | number = 1;
        let timeLeft = minutes * seconds;
        let combatTime = setInterval(function () {
            minutes = parseInt(String(timeLeft / 60), 10);
            seconds = parseInt(String(timeLeft % 60), 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            // @ts-ignore
            document.getElementById("timer").innerHTML = minutes + ":" + seconds;

            if (--timeLeft < 0) {
                clearInterval(combatTime);
                setAttacked(false);
            }
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

    const buttonClick = new Audio(buttonSound);
    buttonClick.preload = "none";

    const playButtonSound = async () => {
        await buttonClick.play();
    }

    function subtractCost(cost: string) {
        setCostNumber("-" + cost);
        let c = document.getElementById("cost");
        if (c != null) {
            c.classList.remove(styles.costFadeOut);
            void c.offsetWidth;
            c.classList.add(styles.costFadeOut);
        }
    }

    function badStatusPopup() {
        let inUse = document.getElementById("inUse");
        let invalid = document.getElementById("invalid");

        if (inUse != null) {
            inUse.classList.remove(styles.fadeout);
            void inUse.offsetWidth;
            inUse.classList.add(styles.fadeout);
        }
        if (invalid != null) {
            invalid.classList.remove(styles.fadeout);
            void invalid.offsetWidth;
            invalid.classList.add(styles.fadeout);
        }
    }

    window.addEventListener('mineEvent', async () => {
        await mine();
    })

    window.addEventListener('treasureEvent', async () => {
        await treasure();
    });

    const treasure = async () => {
        if (socket) {
            const event: ClientMessages = "Treasure";
            await socket.send(JSON.stringify(event));
        }
    }

    window.addEventListener('diamondEvent', async () => {
        await pickedUpDiamond();
    })

    const pickedUpDiamond = async () => {
        if (socket) {
            const event: ClientMessages = 'Diamond';
            await socket.send(JSON.stringify(event));
        }
    }

    const loadGame = async () => {
        console.log('test load');
        if (socket) {
            setTimeout(async () => {
                const event: ClientMessages = 'LoadGame';
                await socket?.send(JSON.stringify(event));
            }, 200);
        }
    }

    function loadGameData(picked_first_diamond: boolean) {
        game.pickedFirstDiamond = picked_first_diamond;
        game.events.emit('loadGame');
    }

    return (
        <div class={styles.App}>
            <div class={styles.container}>
                <div class={styles.vBar}></div>
                <div class={styles.heil}>
                    <div class={styles.heil_img}></div>
                </div>
                <div class={styles.header}>
                    <img src={clicker_logo} class={styles.header_logo} alt={"ClickerRoyale Logo"}/>
                    <Show when={!loggedIn()}
                          fallback={<button id="signOut" class={styles.User_symbol} onClick={() => {
                              void sign_out();
                              setShow(false);
                              setInnerShow(false)
                          }}></button>} keyed>
                        <button onClick={(e) => {
                            setShow(true);
                            void playButtonSound()
                        }} class={styles.button_sign_up}>Login
                        </button>
                        <Show when={show()}
                              fallback={""} keyed>
                            <div class={styles.modal} use:clickOutside={() => setShow(false)}>
                                <div class={styles.popup_h}>
                                    <h3>Login</h3>
                                </div>
                                <input type="text" ref={email_field!} style="width: 300px;"
                                       placeholder="email.."/>
                                <input type="password" ref={password_field!} style="width: 300px;"
                                       placeholder="password.."/>
                                <input type="submit" value="Log In" onClick={login}/>
                                <div id={"invalid"} class={styles.invalid}>
                                    <label>Invalid Credentials</label>
                                </div>
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
                              fallback={""} keyed>
                            <div class={styles.modal} use:clickOutside={() => setInnerShow(false)}>
                                <div class={styles.popup_h}>
                                    <h3>Sign Up</h3>
                                </div>
                                <input type="text" ref={email_field!} style="width: 300px;"
                                       placeholder="email.."/>
                                <input type="password" ref={password_field!} style="width: 300px;"
                                       placeholder="password.."/>
                                <input type="submit" value="Sign Up" onClick={sign_up}/>
                                <div id={"inUse"} class={styles.invalid}>
                                    <label>Email already in use</label>
                                </div>
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
                <div class={styles.woodBar}>
                </div>
                <div class={styles.board}>
                    <div class={styles.val_board}>
                        <div class={styles.board_img_container}>
                            <img src={board} class={styles.board_img} alt={"Value board"}/>
                            <div id={"cost"} class={styles.cost}>{costNumber()}</div>
                            <div class={styles.label_header + " " + displayModule.label_ore}>
                                <label>{formatNumbers(ore())}</label>
                            </div>
                            <div class={styles.label_header + " " + displayModule.label_depth}>
                                <label>{formatNumbers(depth())}</label>
                            </div>
                            <div class={styles.label_header + " " + displayModule.label_diamond}>
                                <label>{diamond}</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div id={'main'} class={styles.main} onClick={() => {
                }}>
                </div>
                <div class={styles.controls}>
                    <a class={styles.gear_normal + " " + styles.gear_left}/>
                    <a class={styles.gear_normal + " " + styles.gear_right}></a>
                    <Show when={showPVP()}
                          fallback={
                              <>
                                  <div class={styles.buttonitem}>
                                      <button onClick={(e) => {
                                          void playButtonSound();
                                          setShowPVP(true);
                                          hide();
                                          rotateGearIn();
                                      }} class={styles.button}>PVP
                                      </button>
                                  </div>
                              </>
                          } keyed>
                        <div class={styles.slideIn}>
                            <div class={styles.image_container}>
                                <img src={board_right} class={styles.board_img_right} alt={"Control board"}/>
                                <button class={styles.button_close} onClick={() => {
                                    slideOut();
                                    window.setTimeout(function () {
                                        setShowPVP(false);
                                        unHide();
                                    }, 1300);
                                    rotateGearOut();
                                }}>
                                    <label class={styles.label_header + " " + styles.label_close}>X</label>
                                </button>
                                <a class={styles.label_board}>
                                    <label class={styles.label_header + " " + pvpModule.label_pvp}>PVP</label>
                                </a>
                                <button attLvl={'Lv' + attackLevel()}
                                        class={styles.button + " " + pvpModule.upgrade_attack}
                                        onClick={() => {
                                            void upgradeAttackLevel();
                                        }}><span>ATK</span>
                                    <a class={styles.icon_upgrade + " " + pvpModule.icon_upgrade_attack}></a>
                                </button>
                                <label
                                    class={styles.label_header + " " + pvpModule.label_attack_level}>{formatNumbers(attackPrice())}</label>
                                <a class={styles.ore + " " + pvpModule.attack_ore}></a>
                                <button defLvl={'Lv' + defenceLevel()}
                                        class={styles.button + " " + pvpModule.upgrade_defence}
                                        onClick={() => {
                                            void upgradeDefenceLevel();
                                        }}><span>DEF</span>
                                    <a class={styles.icon_upgrade + " " + pvpModule.icon_upgrade_defence}></a>
                                </button>
                                <label
                                    class={styles.label_header + " " + pvpModule.label_defence_level}>{formatNumbers(defencePrice())}</label>
                                <Show when={attacked()}
                                      fallback={<button class={styles.button + " " + pvpModule.pvp_attack}
                                                        onClick={attack}></button>} keyed>
                                    <div class={pvpModule.pvp_clock}>
                                        <div class={pvpModule.firstHand}></div>
                                        <div class={pvpModule.secondHand}></div>
                                    </div>
                                    <span id={"timer"} class={styles.label_header + " " + styles.time}>00:10</span>
                                </Show>
                            </div>
                        </div>
                    </Show>

                    <Show when={showMining()}
                          fallback={
                              <>
                                  <div class={styles.buttonitem}>
                                      <button onClick={(e) => {
                                          void playButtonSound();
                                          setShowMining(true);
                                          hide();
                                          rotateGearIn();
                                          console.log("Automation: " + automation_on());
                                      }} class={styles.button}>Mining
                                      </button>
                                  </div>
                              </>
                          } keyed>
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
                                rotateGearOut();
                            }}>
                                <label class={styles.label_header + " " + styles.label_close}>X</label>
                            </button>
                            <a class={styles.label_board}>
                                <label class={styles.label_header + " " + mineModule.label_mine}>Mining</label>
                            </a>
                            <button shovelSpeedLvl={'Lv' + shovelDepth()}
                                    class={styles.button + " " + mineModule.upgrade_speed}
                                    onClick={() => {
                                        void upgradeShovelDepth();
                                    }}><span>Depth</span>
                                <a class={styles.icon_upgrade + " " + mineModule.icon_upgrade_speed}></a>
                            </button>
                            <label
                                class={styles.label_header + " " + mineModule.label_speed_level}>{formatNumbers(shovelDepthPrice())}</label>

                            <button shovelAmountLvl={'Lv' + shovelAmount()}
                                    class={styles.button + " " + mineModule.upgrade_amount}
                                    onClick={() => {
                                        void upgradeShovelAmount();
                                    }}><span>Amount</span>
                                <a class={styles.icon_upgrade + " " + mineModule.icon_upgrade_amount}></a>
                            </button>
                            <label
                                class={styles.label_header + " " + mineModule.label_amount_level}>{formatNumbers(shovelAmountPrice())}</label>

                            <Show when={automation_on()}
                                  fallback={<>
                                      <button class={styles.button + " " + mineModule.automate}
                                              onClick={() => {
                                                  void automate();
                                              }}>Automate
                                          <a class={styles.icon_upgrade + " " + mineModule.icon_automate}></a>
                                      </button>
                                      <label
                                          class={styles.label_header + " " + mineModule.label_automate_cost}>200</label>
                                  </>} keyed>
                                <label class={styles.label_header + " " + mineModule.label_automate}>Automate On</label>
                                <div class={styles.slideIn_automate}>
                                    <div class={styles.image_container_automate}>
                                        <img src={small_board} class={styles.board_img_automate}
                                             alt={"Automate Board"}/>
                                        <a class={mineModule.auto_label_board}>
                                            <label
                                                class={styles.label_header + " " + mineModule.label_auto}>Automate</label>
                                        </a>
                                        <button autoDepthLvl={'Lv' + autoDepth()}
                                                class={styles.button + " " + mineModule.upgrade_automate_speed}
                                                onClick={() => {
                                                    void upgradeAutoDepth();
                                                }}><span>Depth</span>
                                            <a class={styles.icon_upgrade + " " + mineModule.icon_upgrade_automate_speed}></a>
                                        </button>
                                        <label
                                            class={styles.label_header + " " + mineModule.label_speed_automate_level}>{formatNumbers(autoDepthPrice())}</label>

                                        <button autoAmountLvl={'Lv' + autoAmount()}
                                                class={styles.button + " " + mineModule.upgrade_automate_amount}
                                                onClick={() => {
                                                    void upgradeAutoAmount();
                                                }}><span>Amount</span>
                                            <a class={styles.icon_upgrade + " " + mineModule.icon_upgrade_automate_amount}></a>
                                        </button>
                                        <label
                                            class={styles.label_header + " " + mineModule.label_amount_automate_level}>{formatNumbers(autoAmountPrice())}</label>
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

                    <Show when={showLoot()} keyed>
                        <div class={styles.modal} use:clickOutside={() => setShowLoot(false)}>
                            <label style="font-size:30px"> Success! </label>
                            <label style="font-size:20px"> Your Loot:</label>
                            <div class={styles.grid_loot}>
                                <div class={styles.grid_loot_icon}></div>
                                <label class={styles.grid_loot_label}
                                       style="font-size:20px">{formatNumbers(loot())}</label>
                            </div>
                        </div>
                    </Show>

                    <Show when={showOfflineResources()} keyed>
                        <div class={styles.modal} use:clickOutside={() => setShowOfflineResources(false)}>
                            <label style="font-size:30px"> Welcome back!</label>
                            <label style="font-size:20px">Your Offline Loot:</label>
                            <div class={styles.grid_ore}>
                                <div class={styles.grid_ore_icon}></div>
                                <label class={styles.grid_ore_label}
                                       style="font-size:20px">{formatNumbers(totalAmount())}</label>
                            </div>
                            <div class={styles.grid_depth}>
                                <div class={styles.grid_depth_icon}></div>
                                <label class={styles.grid_depth_label}
                                       style="font-size:20px">{formatNumbers(totalDepth())}</label>
                            </div>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    )
        ;
};

export default App;
