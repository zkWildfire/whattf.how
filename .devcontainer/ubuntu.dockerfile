FROM ubuntu:jammy
USER root

ARG USERNAME
ARG USER_UID
ARG USER_GID
# This is the latest LTS release as of 2023-06-14
ARG NODE_VERSION=18.16.0
ARG PYTHON_VERSION=3.11

# Install required packages
RUN apt-get update -y && \
	apt-get install -y --no-install-recommends \
		build-essential \
		curl \
		git \
		graphviz \
		openjdk-19-jdk-headless \
		python${PYTHON_VERSION} \
		python3-pip \
		ruby-full \
		ssh \
		sudo \
		tar \
		tree \
		unzip \
		vim \
		wget \
		zip \
		zlib1g-dev

# Set up plantuml
# Force calls to plantuml from the jekyll plugin to always use the config
#   file in the workspace
RUN wget https://github.com/plantuml/plantuml/releases/download/v1.2023.9/plantuml-1.2023.9.jar \
		-O /usr/bin/plantuml-real && \
	echo "#!/usr/bin/env bash" > /usr/bin/plantuml && \
	echo -n "java -jar /usr/bin/plantuml-real " >> /usr/bin/plantuml && \
	echo -n "-config '/workspaces/whattf.how/_plantuml/plantuml.conf' " >> /usr/bin/plantuml && \
	echo "\$@" >> /usr/bin/plantuml && \
	chmod +x /usr/bin/plantuml

# Create the user
RUN groupadd --gid $USER_GID $USERNAME && \
	useradd --uid $USER_UID --gid $USER_GID -m $USERNAME -s /bin/bash && \
	echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME && \
	chmod 0440 /etc/sudoers.d/$USERNAME
USER $USERNAME

# Set up npm and packages
# This needs to be set up via nvm because the version of node that gets
#   installed via apt (as of 2023-06-14) doesn't support some syntax used in
#   the tsc.js file
RUN mkdir /tmp/nvm && \
	cd /tmp/nvm && \
	# Install nvm
	curl -sL https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.0/install.sh -o install_nvm.sh && \
	bash install_nvm.sh && \
	# Install node + npm
	export NVM_DIR=$HOME/.nvm && \
	chmod +x $NVM_DIR/nvm.sh && \
	. $NVM_DIR/nvm.sh && \
	nvm install ${NODE_VERSION} && \
	nvm alias default ${NODE_VERSION} && \
	nvm use default && \
	# Install tsc globally
	npm install -g --save-dev \
		typescript && \
	# Handle cleanup
	cd $HOME && \
	rm -rf /tmp/nvm

# Configure Ruby gems to be installed to a user directory
RUN echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc && \
	echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc && \
	GEM_HOME=$HOME/gems PATH=$HOME/gems/bin:$PATH gem install \
		bundler

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH
