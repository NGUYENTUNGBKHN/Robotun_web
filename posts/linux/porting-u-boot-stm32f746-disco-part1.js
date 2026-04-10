POSTS_DATA.push({
  id: "porting-u-boot-stm32f746-disco-part1",
  title: "Porting U-Boot on stm32f746-disco - Part1",
  excerpt: "Porting U-Boot on stm32f746-disco - Part1",
  date: "2026-03-31",
  author: "Gentantun",
  tags: ["stm32", "mcu", "stm32f746", "linux"],
  content: `## Introduction

- U-Boot :

## Re-configure U-Boot configuration file

New source


\`\`\`c
make <defconfig_goc>make menuconfig
make savedefconfig
cp defconfig configs/<name>_defconfig 
\`\`\`
or
From available config file
\`\`\`c
make stm32mp15_defconfig
make menuconfig
make savedefconfig
cp defconfig configs/<name>_defconfig 
\`\`\`
### Config setup
Architecture select
- ARC architecture
- ARM architecture
- M68000 architecture
- MicroBlaze architecture
- MIPS architecture
- Nios II architecture
- PowerPC architecture
- RISC-V architecture
- Sandbox
- SuperH architecture
- x86 architecture
- Xtensa architecture Skipping low level initialization functions
- You should select disable


ARM architecture


- use an assembly optimized implementation of memcpy


- Use an assembly optimized implementation of memset


- Target select : Support STMicroelectronics STM32 MCU with cortex M

- stm32f7 family


- stm32f746 Discovery board


General setup


- Number of DRAM banks : 1


- Use a custom location for the initial stack pointer address


- Static location for the initial stack pointer : 0x20050000


- Define memory for Dynamic allocation : 0x1000000


- Address in memory to use by default : 0x80080000


Boot options/Autoboot options


- Delay in seconds before automatically booting


Boot options/Enable boot arguments


\`\`\`c
console=ttySTM0,115200 earlyprintk consoleblank=0 ignore_loglevel
\`\`\`


Boot options/Enable a default value for bootcmd


\`\`\`c
run distro_bootcmd
\`\`\`


- Default fdt file : stm32f746-disco


Console


- Console input buffer size : 1024


- Console output buffer size : 1050


- loglevel : 4


- Enable console flush support


- Enable console multiplexing


- Select console devices from the enviroment


- Enable a null device for stdio


Init options


- Display information about the board during early start up


Device tree control


- Run-time configuration via Device tree


- Enable use of device tree imported from Linux kernel release


- Default device tree for DT control: st/stm32f746-disco


- Size of memory reserved to uncompress the DTBs : 0x80000


Enviroment 


- Minimum number of entries in the enviroment hashtable : 64


- Maxium number of entries in the enviroment hashtable : 512


- Enviroment Size : 0x2000


- Relocate gd->env_addr


Device Drivers


- use block device cache


- GPIo support : ST STM32 GPIO driver


- I2C support


- Enable inpur subsystems


- Network device support


- Power


- Serial


- Spi support


Device Drivers/Clock


- Enable clock driver support for STM32F family


Device Drivers/Led Support


- Enable LED support 


- Enable LED boot support


- LED support for GPIO-connected LEDs


Device Drivers/Multifunction device drivers


- Enable RCC driver for the STM32 SoC's family


Device Drivers/MMC Host controller Support


- MMC/SD/SDIO card support


- support for MMC/SD write operations


- ARM AMBA Multimedia Car Interface and compatible support 


- Enable quirks


- Block count limit : 65535


- Support for HW partitioning command (eMMC)


- Output more information about the MMC


Device Drivers/MTD Support 


- Enable MTD layer


- Enable Driver model for MTD drivers


- Enalbe parallel NOR flash support


- STM32 MCU Flash driver


- Maxium number of sectors on a flash chip : 8


- Enable Max number of Flash memory banks


- Max number of Flash memory banks : 1


Device Drivers/MTD Support/SPI Flash support


- Enable driver model for spi flash


- SPI fklash core interface support


- SPI Flash defatult bus identifier


- SPI flash default Chip-select


- SPI flash default mode (see include/spi.h) : 0x0


- SPI flash default speed in Hz : 1000000


- Smrart hardware capability detection based on SPI MEM supports_op() hook


- Enable the Blocking feature


- Unclock the entire SPI flash on u-boot startup


- Macronix SPI flash support


- STMicro SPI flash support


- Use small 4096 B erase sectors


Device Drivers/Remote processor drivers


- Maximum size of fireware file that needs to be loaded to the remote processor


Device Drivers/Reset Controller support


- Enable reset controller using Driver Model


- Enable the STM32 reset


Device Drivers/Serial


- Default baudrate : 115200


- Require a serial port for console


- Provide a serial driver


- Enable Driver model for serial drivers


- STMicroelectronics STm32 SoCs no-chip UART


Device Drivers/SPI support


- Enable Driver Model for SPI drivers


- SPI memory extension


- STM32F7 QSPI driver


Device Drivers/Timer Support


- STM32 timer support drvier


Device Drivers/Graphics Support


- Enable driver model support for LCD/video


- 8 x 16 font size


- Show the U-boot logo on the display


- Enable panel blacklight uclass support


- Default framebuffer size to use if no drvers request it


- Enable damage trcking of frame buffer regions


- Generic GPIO based Backlight Driver


- Support 8-bit-per-pixel displays


- Support 16-bit-per-pixel displays


- Support 32-bit-per-pixel displays


- Support a simple text console


- Video-sync period in miulliseconds for foreground processing : 100


- Video-sync period in milliseconds for cyclic processing : 10


- Enable panel uclass support


- Enable simple panel support


- Enable STm32 video support 


- Number of lines to scroll the console by : 1


- Show a splash-screen image


- Allow psitioning the splash image anywhere on the display


- Enable bmp image display


- Maximum size of the bitmap logo in bytes : 0x100000


- Run length encoded BMP image (RLE8) support


- 16-bit-per-pixel BMP image support


- 24-bit-per-pixel BMP image support

- 32-bit-per-pixel BMP image support

Device Drivers/Watchdog Timer support


- watchdog timeout in msec : 60000


Networking


- Networking stack : Legacy U-boot networking stack


- Milliseconds before trying ARP again : 5000


- Number of timeouts before giving up : 5


- Enable generic udp framework


- Netconsole support 


- TFTP windows size : 1


- # of additional milliseconds to wait for ProxyDHCP response : 100 


- option 17 root path length : 64


- Enable bootdev for ethernet


- Random ethaddr if unset


- Enable DNS resolutions


- TFTP block size : 1468


- Number of receive packet buffers : 4


File systems


- Enable ext4 filesystem support


- Enable FAT filesystem write support


- Set maximum possible clustersize 65536


Library Routines


- Use private libgcc


- Enable regular expression support


- Enable the FDT library


- Mask of conditions to assume for libfdt : 0x0


- Free space added to device-tree before booting : 0x3000


- Enable the logical memory block library


Tools options 


- Path to dtc binary for use within mkimage : dtc


- use OpenSSL's libcrypto library for host tools




- Enable kwbimage support in host tools


## Tips setup wsl


\`\`\`c
sudo nano /etc/wsl.conf
\`\`\`


\`\`\`c
[interop]
appendWindowsPath = false
\`\`\`


## Reference material`
});