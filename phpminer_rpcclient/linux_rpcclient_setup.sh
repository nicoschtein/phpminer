#!/bin/sh
if [ "$(id -u)" != "0" ]; then
    echo "This script must be run as root" 1>&2
    exit 1
fi

# Setup required variables.
echo "Setup required variables."
PHPMINER_PATH=`readlink -f $0`
PHPMINER_PATH=`dirname $PHPMINER_PATH`
SERVICE_SCRIPT="$PHPMINER_PATH/phpminer_rpcclient"
PHPMINER_PATH_CONFIG="$PHPMINER_PATH/config.php"

# Get reuired user info
echo "Please enter the user on which phpminer_rpcclient should run:"
read USER

USER_EXISTS=`grep "$USER:x:" /etc/passwd`

if [ -n "$USER_EXISTS" ]; then
    echo "Check if user exist: OK"
else
    echo "The provided user does not exists within your system."; 
    exit 0
fi

# Get reuired ip info
POSSIBLE_IPS=$(ip addr |grep "inet" |grep -v "inet6" |cut -d"/" -f1 |cut -d" " -f6)
POSSIBLE_IPS="$POSSIBLE_IPS 0.0.0.0"
echo "Please enter the IP-Address on which the service should listen (Default: 127.0.0.1):"
echo "Possible IP-Address:"
echo $POSSIBLE_IPS
read IP

if [ -n "$IP" ]; then
    echo "Using ip: $IP"
else
    IP="127.0.0.1"
    echo "Using ip: $IP"
fi

echo "Please enter the Port on which the service should listen (Default: 11111):"
read PORT
if [ -n "$PORT" ]; then
    echo "Using port: $PORT"
else
    PORT="11111"
    echo "Using port: $PORT"
fi

echo "Please enter the the RPC-Key, this key is used to make sure that no other client than phpminer can operate with this service. THIS CAN NOT BE EMPTY"
read RPCKEY
if [ -n "$RPCKEY" ]; then
    echo "Using rpckey: $RPCKEY"
else
    echo "RPC-Key can not be empty"
    exit 0
fi

echo "Please provide the path to cgminer.conf. If you don't have a config file yet, provide a directory where '$USER' has read AND write access (Default: /opt/cgminer):"
read CGMINER_PATH
if [ -n "$CGMINER_PATH" ]; then
    echo "Using cgminer path: $CGMINER_PATH"
else
    CGMINER_PATH="/opt/cgminer"
    echo "Using cgminer path: $CGMINER_PATH"
fi
CGMINER_CONFIG="$CGMINER_PATH/cgminer.conf"
echo "Using cgminer config file: $CGMINER_CONFIG"

echo "Please provide the amd sdk path. At some machines this is required to enable overclocking. (Default: empty):"
read AMD_SDK
if [ -n "$AMD_SDK" ]; then
    echo "Using amd sdk: $AMD_SDK"
else
    echo "Will not use amd sdk."
fi


echo "
<?php
/* * ********* CONFIG ***************** */

// Service IP.
// This address is used to bind the service.
// If you provide 0.0.0.0 all interface are bound, this means that the api is connectable at any ip-address on this machine.
// Provide 127.0.0.1 to only allow localhost.
// If your rig is within your local network, provide the ip address which you eather configurated by your self or got from your router per DHCP.
\$config['ip'] = '$IP';

// Service port, change it to your needs, please keep in mind, in Linux ports lower 1000 can only be created by user root.
\$config['port'] = $PORT;

// RPC Secret key.
\$config['rpc_key'] = '$RPCKEY';

// The path + file where the cgminer.conf is.
// Please make sure that the user which run's this script has the permission to edit this file.
\$config['cgminer_config_path'] = '$CGMINER_CONFIG';

// The path where the cgminer executable is.
// Please make sure that the user which run's this script has the permission to start cgminer.
\$config['cgminer_path'] = '$CGMINER_PATH';

// Path to AMD SDK if available (Normally this is only needed within Linux)
\$config['amd_sdk'] = '$AMD_SDK';

/* * ********* CONFIG END ************* */" > $PHPMINER_PATH_CONFIG;

# Install required software.
echo "Install required software."
apt-get install -y sudo php5-cli php5-mcrypt php5-mhash curl php5-curl screen

# Setup sudo entries
echo "Setup sudo entries"
groupadd reboot
echo "adduser $USER reboot" | sh

echo "# PHPMiner RPCClient" >> /etc/sudoers
echo "%reboot ALL=(root) NOPASSWD: /sbin/reboot" >> /etc/sudoers
echo "%reboot ALL=(root) NOPASSWD: /sbin/shutdown" >> /etc/sudoers

# Install cronjob
echo "Config service script."

SEARCH=$(echo "{/PATH/TO/phpminer_rpcclient}" | sed -e 's/[]\/()$*.^|[]/\\&/g')
REPLACE=$(echo "$PHPMINER_PATH" | sed -e 's/[\/&]/\\&/g')
echo "sed -i -e \"s/$SEARCH/$REPLACE/g\" $SERVICE_SCRIPT" | sh
echo "sed -i -e \"s/{USER}/$USER/g\" $SERVICE_SCRIPT" | sh
echo "cp $SERVICE_SCRIPT /etc/init.d/" | sh
chmod +x /etc/init.d/phpminer_rpcclient
echo "sed -i s/\\\'127.0.0.1\\\'/\\\'$IP\\\'/g $PHPMINER_PATH/config.php" | sh

echo "Install service script for autostart."
update-rc.d phpminer_rpcclient defaults 98
insserv phpminer_rpcclient

echo "Starting phpminer rpc client"
service phpminer_rpcclient start

echo "PHPMiner rig installation finshed."
echo "If there exists 1 line of text between the lines 'Install service script for autostart.' and 'Starting phpminer rpc client'. Reboot the rig"
echo "After rebooting type 'ps auxf | grep phpminer | grep -v grep' and check if phpminer_rpcclient is started successfully (one line should appear)'"