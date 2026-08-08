export default function Environment() {
  return (
    <>
      <color attach="background" args={["#bfe8f5"]} />

      <ambientLight intensity={1.5} />

      <directionalLight
        position={[5, 10, 5]}
        intensity={2}
        castShadow
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#82bd69" />
      </mesh>

      <mesh position={[-5, -1.2, -5]} scale={[5, 2, 3]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#9bca7c" />
      </mesh>

      <mesh position={[5, -1.3, -6]} scale={[5, 2, 3]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#72aa67" />
      </mesh>
    </>
  );
}