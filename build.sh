run_dir=$(pwd)
cd $run_dir/packages/platform-modules && npm install --production && node bundle.js
cd $run_dir
NODE_TLS_REJECT_UNAUTHORIZED=0 meteor npm install --production
NODE_TLS_REJECT_UNAUTHORIZED=0 meteor build /home/meteor/bundle --server-only --directory --allow-incompatible-update
