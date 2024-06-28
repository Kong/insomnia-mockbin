with import <nixpkgs> { };

mkShell {
  nativeBuildInputs = [
    nodejs_22
    biome
  ];
  BIOME_BINARY = "${biome}/bin/biome";
}
