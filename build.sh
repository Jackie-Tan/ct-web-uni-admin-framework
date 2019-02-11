run_dir=$(pwd)
npm config set registry http://npm.chotot.org
cd /home/meteor/platform-modules && npm install --production && node bundle.js
ln -s /home/meteor/platform-modules $run_dir/packages
cd $run_dir
meteor npm install --production
meteor build /home/meteor/bundle --server-only --directory --allow-incompatible-update