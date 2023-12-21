with import <nixpkgs> { };

mkShell {
  nativeBuildInputs = [
    nodejs_21
    biome
  ];
  BIOME_BINARY = "${biome}/bin/biome";
}
