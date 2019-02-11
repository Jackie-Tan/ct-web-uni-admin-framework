run_dir=$(pwd)
cd /home/meteor/platform-modules && npm install --production && node bundle.js && rm -rf node_modules
cp -R /home/meteor/platform-modules $run_dir/packages/platform-modules
cd $run_dir
meteor npm install --production
meteor build /home/meteor/bundle --server-only --directory --allow-incompatible-update