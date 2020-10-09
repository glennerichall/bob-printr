export const files = [
  {
    name: '(Pdf) Linux Drop Over Me.desktop',
    content: `[Desktop Entry]
Encoding=UTF-8
Name=Drop Over Me
Comment=Execute the script with the file dropped
Exec=gnome-terminal -- "@{curdir}/export2pdf.sh"
Icon=utilities-terminal
Type=Application
Terminal=true
Name[en_CA]=(Pdf) Linux Drop Over Me`,
  },
  {
    name: 'export2pdf.sh',
    content: `#!/bin/bash
source ~/.bashrc
bobp --version
bobp print "$1" --destination "$1/../pdfs_\${1##*/}" @{preset}`,
  },
];
