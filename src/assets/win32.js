export const files = [
  {
    name: '(Compile) Windows Drop Over Me.bat',
    content: `@echo off
    call bobp --version
    call bobp print "%~1" --destination "pdfs_%~n1" @{preset}
    pause`,
  },
];
