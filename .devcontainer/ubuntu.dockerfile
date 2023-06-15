FROM ubuntu:jammy
USER root

ARG USERNAME
ARG USER_UID
ARG USER_GID
ARG PYTHON_VERSION=3.11

# Install required apt packages
RUN apt-get update -y && \
	apt-get install -y --no-install-recommends \
		build-essential \
		curl \
		git \
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

# Create the user
RUN groupadd --gid $USER_GID $USERNAME && \
	useradd --uid $USER_UID --gid $USER_GID -m $USERNAME -s /bin/bash && \
	echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME && \
	chmod 0440 /etc/sudoers.d/$USERNAME
USER $USERNAME

# Configure Ruby gems to be installed to a user directory
RUN echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc && \
	echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc && \
	GEM_HOME=$HOME/gems PATH=$HOME/gems/bin:$PATH gem install \
		jekyll \
		bundler
