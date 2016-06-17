#!/usr/bin/env bash

cat << "EOHEADER";
;(function () {
EOHEADER
cat lib.js model.js audio.js view.js ready.js test.js | \
    sed -e 's/^/  /g'
cat << "EOFOOTER";
}())
EOFOOTER

# vi:

