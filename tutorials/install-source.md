---

layout: docs
title: "Tutorials | Building From Source"

---

You will need `go` and `git` installed to do this.

## Install Go

At the current time, `eris` requires `go` version >= {{ site.data.coding["golang"].minimum }}. Go is not needed if you install `eris` as a binary.

An easy way to install Go (for OSX and Linux) is via the Travis-CI's [Gimme](https://github.com/travis-ci/gimme) tool. First you install Gimme; then running the `eval $(gimme {{ site.data.coding["golang"].authoritative }})` command and you'll be all set up.

Otherwise, please see the documentation in [this link](https://golang.org/doc/install) on how to install it.

Make sure that Go is properly installed by running:

```
go version
```

Once you have Go installed, you will then want to check if you also have your `$GOBIN` value in your `$PATH`. Most gophers add the following lines to their `~/.bashrc`, `~/.profile`, `~/.zshrc` file or other relevant file.

```
export GOPATH=$HOME
export GOBIN=$GOPATH/bin
export PATH="$GOBIN:$PATH"
```

For Go version 1.5 you'd need an additional `export` command (for version 1.6 and above this is no longer needed):

```
export GO15VENDOREXPERIMENT=1
```

**Note** you will need to double check that you perform the above commands for the *user* which will be running `eris`.

If you do not add those lines to the relevant shell files then you can just type them into the shell each time you log in. You can check that this change was added by running the `echo $PATH|tr ':' '\n'` command and making sure that your path has been updated appropriately.

Now you're ready to install the components of the Eris platform.

## Building Eris from source

Go makes it very easy to build from source. Indeed, it is really only one command.

```
go install github.com/eris-ltd/eris-cli/cmd/eris
eris init
```

Now you're ready to go (if you pardon the pun)!

#### **Tip**: To see all the new stuff happening:

```
eris update --branch develop
```
