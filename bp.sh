#!/usr/bin/env bash

cat << "EOHEADER";
/* Beat player v0.0.1*/
;(function () {
EOHEADER
cat $@ | \
    sed -e 's/^/  /g'
cat << "EOFOOTER";
}())
EOFOOTER

# vi:

