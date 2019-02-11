run_dir=$(pwd)
cd $run_dir/packages/platform-modules && npm install --production && node bundle.js
cd $run_dir
meteor npm install --production
meteor build /home/meteor/bundle --server-only --directory --allow-incompatible-update