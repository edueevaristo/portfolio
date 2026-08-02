# 3D asset contract

The production sculpture belongs in this folder as `signal-sculpture.glb`.

- glTF 2.0 binary, Y-up, meters
- Draco or Meshopt geometry compression
- KTX2/Basis textures, maximum 1024 px
- one key light baked only when it improves fidelity
- target transfer size: 350 KB or less
- no more than 70k visible triangles on desktop

The runtime intentionally falls back to a procedural PBR sculpture until the art-directed Blender export is supplied. Low-power, data-saver, narrow and reduced-motion clients use the static SVG fallback and never download Three.js.
