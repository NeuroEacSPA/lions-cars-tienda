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
      <PointMaterial transparent color="#E8B923" size={0.0045} sizeAttenuation depthWrite={false} opacity={0.5} />
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

function FloatingShapes() {
  const r1 = useRef<THREE.Mesh>(null!)
  const r2 = useRef<THREE.Mesh>(null!)
  const r3 = useRef<THREE.Mesh>(null!)
  const r4 = useRef<THREE.Mesh>(null!)

  useFrame((s) => {
    const t = s.clock.getElapsedTime()
    if (r1.current) {
      r1.current.rotation.x = t * 0.35
      r1.current.rotation.y = t * 0.25
      r1.current.position.y = 0.4 + Math.sin(t * 0.8) * 0.12
    }
    if (r2.current) {
      r2.current.rotation.x = -t * 0.28
      r2.current.rotation.z = t * 0.35
      r2.current.position.y = -0.3 + Math.sin(t * 0.65 + 1) * 0.1
    }
    if (r3.current) {
      r3.current.rotation.y = t * 0.5
      r3.current.rotation.x = t * 0.2
      r3.current.position.y = -1.0 + Math.sin(t * 0.9 + 2) * 0.08
    }
    if (r4.current) {
      r4.current.rotation.x = t * 0.18
      r4.current.rotation.y = -t * 0.3
      r4.current.position.y = 1.0 + Math.sin(t * 0.55 + 3) * 0.1
    }
  })

  return (
    <>
      <mesh ref={r1} position={[1.6, 0.4, -1.5]}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshBasicMaterial color="#C8102E" wireframe transparent opacity={0.28} />
      </mesh>
      <mesh ref={r2} position={[-1.7, -0.3, -2]}>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshBasicMaterial color="#E8B923" wireframe transparent opacity={0.22} />
      </mesh>
      <mesh ref={r3} position={[0.3, -1.0, -2.5]}>
        <torusGeometry args={[0.35, 0.1, 6, 16]} />
        <meshBasicMaterial color="#C8102E" wireframe transparent opacity={0.2} />
      </mesh>
      <mesh ref={r4} position={[-0.5, 1.0, -1.8]}>
        <dodecahedronGeometry args={[0.25, 0]} />
        <meshBasicMaterial color="#E8B923" wireframe transparent opacity={0.3} />
      </mesh>
    </>
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
        <FloatingShapes />
      </Canvas>
    </div>
  )
}
