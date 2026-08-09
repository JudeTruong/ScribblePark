import { useMemo } from "react";
import {
  Billboard,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

export default function Flower({
  id,
  imageUrl,
  name,
  classification = "flower",
  position = {
    x: 0,
    y: 0,
    z: 0,
  },
  scale = 1,
  highlighted = false,
}) {
  const texture = useTexture(imageUrl);

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.magFilter =
    THREE.NearestFilter;

  texture.minFilter =
    THREE.NearestFilter;

  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  const outlineUniforms = useMemo(
    () => ({
      uTexture: {
        value: texture,
      },
    }),
    [texture]
  );

  return (
    <group
      position={[
        position.x ?? 0,
        position.y ?? 0,
        position.z ?? 0,
      ]}
      name={name}
    >
      {/* Ground shadow */}
      <mesh
        position={[0, 0.015, 0]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        scale={scale}
        raycast={() => null}
      >
        <circleGeometry
          args={[0.32, 24]}
        />

        <meshBasicMaterial
          color="#365e35"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* Keeps the drawing facing the camera */}
      <Billboard
        position={[
          0,
          0.75 * scale,
          0,
        ]}
        follow
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        {/* Thin pure-white highlight */}
        {highlighted && (
          <mesh
            position={[
              0,
              0,
              -0.02,
            ]}
            scale={scale * 1.045}
            raycast={() => null}
            renderOrder={1}
          >
            <planeGeometry
              args={[1.5, 1.5]}
            />

            <shaderMaterial
              uniforms={
                outlineUniforms
              }
              vertexShader={`
                varying vec2 vUv;

                void main() {
                  vUv = uv;

                  gl_Position =
                    projectionMatrix *
                    modelViewMatrix *
                    vec4(
                      position,
                      1.0
                    );
                }
              `}
              fragmentShader={`
                uniform sampler2D uTexture;
                varying vec2 vUv;

                void main() {
                  vec4 image =
                    texture2D(
                      uTexture,
                      vUv
                    );

                  if (image.a < 0.05) {
                    discard;
                  }

                  gl_FragColor =
                    vec4(
                      1.0,
                      1.0,
                      1.0,
                      image.a
                    );
                }
              `}
              transparent
              depthWrite={false}
              toneMapped={false}
              side={
                THREE.DoubleSide
              }
            />
          </mesh>
        )}

        {/* Original user drawing */}
        <mesh
          scale={scale}
          renderOrder={2}
          userData={{
            creationId: id,
            classification,
          }}
        >
          <planeGeometry
            args={[1.5, 1.5]}
          />

          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.05}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}