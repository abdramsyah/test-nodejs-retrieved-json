#!/bin/bash


sudo su - adminapps
# Variabel-variabel yang diperlukan
username="oceaninov"
password="Pi=passw0rd!@#"
repo_directory="/home/adminapps/applications/grosri-be-api/grosri-be-api"

# Ubah direktori kerja ke direktori repo
cd $repo_directory

# Perintah untuk mengklon repo dengan Git
git pull

# Perintah Docker (pastikan izin yang sesuai)
docker stop grosri-be-api
docker rm grosri-be-api
docker build -t asia-southeast2-docker.pkg.dev/xenmo-digital/dev/grosri-be-api:latest-167 .

docker run --name grosri-be-api --net grosri -p 5000:5000 --env-file=.env -d asia-southeast2-docker.pkg.dev/xenmo-digital/dev/grosri-be-api:latest-167
