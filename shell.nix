with import <nixpkgs> { };

mkShell {
  nativeBuildInputs = [
    nodejs-18_x
  ];
}
