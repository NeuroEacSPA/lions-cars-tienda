import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function GoldStars() {
  const ref = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const pos = new Float32Array(2500 * 3)
    for (let i = 0; i < 2500; i++) {
      const r = 1.2 + Math.random() * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [])
  useFrame((_, d) => {
    ref.current.rotation.x -= d / 22
    ref.current.rotation.y -= d / 18
  })
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#FF2040" size={0.004} sizeAttenuation depthWrite={false} opacity={0.35} />
    </Points>
  )
}

function RedStars() {
  const ref = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const pos = new Float32Array(900 * 3)
    for (let i = 0; i < 900; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 7
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2
    }
    return pos
  }, [])
  useFrame((s, d) => {
    ref.current.rotation.y += d / 28
    ref.current.position.y = Math.sin(s.clock.elapsedTime / 5) * 0.08
  })
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#C8102E" size={0.007} sizeAttenuation depthWrite={false} opacity={0.28} />
    </Points>
  )
}


export function Background3D() {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 55 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
      >
        <GoldStars />
        <RedStars />
      </Canvas>
    </div>
  )
}
