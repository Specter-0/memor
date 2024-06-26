"use client"
import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Frosted from "@/components/Frosted";
import Beat from "@/components/Beat";
import BounchingBlock from "@/components/BounchingBlock";
import GameModal from "@/components/GameModal"
import FlashText from "@/components/FlashText";
import Xced from "@/components/Xced";
import { uuid } from "uuidv4";

export default function Page() {
    const [dist, setDist] = useState(120)
    const [nickname, setNickname] = useState("")
    useEffect(() => {window && window.localStorage.getItem("nickname") && setNickname(window.localStorage.getItem("nickname"))}, [])

    const local_gradient = useMemo(() => "linear-gradient(180deg, rgb(170, 0, 90) 0%, rgb(200, 10, 150) 100%)", [])
    const online_gradient = useMemo(() => "linear-gradient(180deg, rgb(150, 220, 0) 0%, rgb(3, 150, 50) 100%)", [])

    const x = useMotionValue(0)
    const xInput = [-dist, 0, dist];
    const background = useTransform(x, xInput, [
        local_gradient,
        "linear-gradient(140deg, rgb(30, 0, 30) 0%, rgb(30, 0, 100) 100%)",
        online_gradient
    ])
    const borderWidth = useTransform(x, xInput, [40, 4, 40])
    const color = useTransform(x, xInput, [
        "rgb(211, 9, 225)",
        "rgb(68, 0, 255)",
        "rgb(3, 209, 0)"
    ])


    const [isDraggable, setIsDraggable] = useState(true);
    const [mode, setMode] = useState(null) // [online, local]
    const [hovering, setHovering] = useState(false)
    const [waited, setWaited] = useState(false)
    
    function handlePointerUp() {
        if (Math.abs(x.get()) > dist) {
            setIsDraggable(false)

            if (x.get() > dist) setMode("online")
            else if (x.get() < -dist) setMode("local")
        }
    }

    if (typeof window !== "undefined") {
        useEffect(() => {
                setDist(window.innerWidth > 768 ? 120 : 60)
                setDist(prev => {
                    console.log(prev)
                    return prev
                })
            }, [window.innerWidth])
    }

    useEffect(() => {
        if (window) {
            window.addEventListener('pointerup', handlePointerUp);
        }

        return () => {
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, []);

    useEffect(() => {
        if (isDraggable) {
            setWaited(false)
            setTimeout(() => setWaited(false), 2024)
        } else {
            setWaited(false)
            setTimeout(() => setWaited(true), 1000)
        }
    }, [isDraggable])


    const [nicknamePop, setNicknamePop] = useState(false)

    useEffect(() => {
        if (!localStorage.getItem("user_id")) {
            localStorage.setItem("user_id", uuid())
        }
    }, [])

    return (
        <motion.main className="relative w-screen h-screen bg-zinc-900 text-white  rounded-md flex flex-col md:flex-row items-center justify-around px-16"
            style={{ background }}
        >
            <Frosted className="bg-white/30 w-2/4 md:w-1/4 h-10 absolute top-10 right-10 overflow-hidden border-cyan-300"
                style={{}}

                animate={nicknamePop ? { borderWidth: 2 } : { borderWidth: 0, }}
                transition={{ duration: 0.1 }}
            >
                <motion.input className="w-full h-full text-center bg-transparent text-lg font-semibold outline-none caret-white"
                    placeholder="Nickname"
                    type="text"
                    value={nickname}

                    animate={nicknamePop ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.1 }}

                    onKeyDown={e => setNicknamePop(true)}
                    onKeyUp={e => setNicknamePop(false)}

                    onChange={e => {
                        setNickname(e.target.value)
                        window.localStorage.setItem("nickname", e.target.value)
                    }}
                />
            </Frosted>

            <motion.div className="absolute w-32 h-32 rounded-full bg-white shadow-2xl
                                    flex items-center justify-center mb-48 md:mb-0"
                drag={isDraggable ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.65}
                style={{ x }}

                initial={{ borderRadius: "0%", rotate: 90 }}
                animate={{ borderRadius: "50%", rotate: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}

                whileDrag={{ scale: 1.1, transition: { duration: 0.2 }}}

                onClick={() => {
                    if (!isDraggable && waited) {
                        setIsDraggable(true) 
                        x.set(0)
                    }
                }}

                onMouseOver={() => {setHovering(true)}}
                onMouseLeave={() => setHovering(false)}
            >
                <AnimatePresence>
                    { !isDraggable ?
                        <Xced color={color} strokeWidth={6} />
                    :
                        <motion.div className="absolute w-1/2 h-1/2 rounded-full transition-all " 
                            style={{ borderColor: color, borderWidth: borderWidth }}
                            initial={{ borderWidth: 60, opacity: 0 }}
                            animate={{ borderWidth: 4, opacity: 1}}
                            exit={{ borderWidth: 0, opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            
                            key="ring"
                        />
                    }
                </AnimatePresence>

                <AnimatePresence>
                    { hovering &&
                        <motion.div className="absolute -top-16 -right-40 w-40 text-sm text-black bg-gradient-to-br from-white to-white/80 backdrop-blur-xl shadow-2xl
                                                border-2 border-white/90 rounded-md p-2 z-50 pointer-events-none"
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 30, opacity: 0}}
                        >
                           { isDraggable ? "Drag right for local play and left for online play" : "Click me to reset"}
                        </motion.div>
                    }
                </AnimatePresence>
            </motion.div>
            
            <Beat x={x} polltime={10}/>

            <FlashText x={x}/>

            <GameModal 
                isDraggable={isDraggable}
                mode={mode}
                nickname={nickname}
            />

            <BounchingBlock speedMultiplier={(nickname == "speed" ? 20 : 1)} />
        </motion.main>
    );
}