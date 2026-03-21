POSTS_DATA.push({
  id: "build-uboot-cyclone-v",
  title: "Building U-Boot for Cyclone V",
  excerpt: "Step-by-step guide to build and deploy U-Boot bootloader on Altera Cyclone V FPGA board",
  date: "2026-03-08",
  author: "RoboTun Team",
  tags: ["u-boot", "cyclone", "altera", "embedded-linux", "bootloader"],
  content: `## U-Boot on Cyclone V

U-Boot is the industry-standard bootloader for embedded Linux. This guide covers Cyclone V boards.

### Prerequisites

Install required build tools:

\`\`\`bash
sudo apt-get install gcc-arm-linux-gnueabihf
sudo apt-get install device-tree-compiler
sudo apt-get install u-boot-tools
\`\`\`

### Download U-Boot Source

\`\`\`bash
git clone https://github.com/altera-opensource/u-boot-socfpga
cd u-boot-socfpga
git checkout socfpga_v2021_10
\`\`\`

### Configure and Build

\`\`\`bash
export CROSS_COMPILE=arm-linux-gnueabihf-
export ARCH=arm

make socfpga_cyclone5_defconfig
make -j4
\`\`\`

### Compile Device Tree

\`\`\`bash
dtc -I dts -O dtb -o socfpga_cyclone5.dtb socfpga_cyclone5.dts
\`\`\`

### Flash to FPGA

Using SD card method:

\`\`\`bash
# Write SPL and U-Boot to SD card
dd if=u-boot-with-spl.sfp of=/dev/sdX bs=64k seek=0
dd if=u-boot.img of=/dev/sdX bs=64k seek=256
sync
\`\`\`

### Verify Boot

Connect serial console (115200 baud) and power cycle:

\`\`\`
U-Boot 2021.10 (Mar 21 2026 - 12:00:00 +0000)

DRAM:  2 GiB
...
Hit any key to stop autoboot: 0
=>
\`\`\`

Your Cyclone V is now running U-Boot and ready to boot Linux!
`
});