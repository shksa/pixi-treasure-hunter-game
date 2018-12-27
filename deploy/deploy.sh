echo "deploying to 139.59.93.218 - sreekar.co"
ssh sreekar339@139.59.93.218 'bash' < ./deploy/deleteRepo.sh

echo "pushing new version of the build"
scp -r build sreekar339@139.59.93.218:~/pixi-treasure-hunter-game