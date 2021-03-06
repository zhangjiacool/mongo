// Attempt to verify that connections can make use of TCP_FASTOPEN

(function() {
'use strict';

// Does it make sense to expect TFO support?
try {
    // Both client and server bits must be set to run this test.
    const val = cat("/proc/sys/net/ipv4/tcp_fastopen");
    if ((Number.parseInt(val) & 3) != 3) {
        print("==Skipping test, tcp_fastopen not enabled: " + val);
        return;
    }
} catch (e) {
    // File not found or unreadable, assume no TFO support.
    print("==Skipping test, unable to read /proc/sys/net/ipv4/tcp_fastopen");
    return;
}

const tcpFastOpen = db.serverStatus().network.tcpFastOpen;
printjson(tcpFastOpen);

const confused = "proc file suggests this kernel is capable, but setsockopt failed";
assert.eq(true, tcpFastOpen.serverSupported, confused);
assert.eq(true, tcpFastOpen.clientSupported, confused);

const countBefore = tcpFastOpen.accepted;

const netConn = runMongoProgram('mongo', '--port', myPort(), '--eval', ';');
assert.eq(0, netConn);

const countAfter = db.serverStatus().network.tcpFastOpen.accepted;
assert.gt(countAfter, countBefore, "Second connection did not trigger TFO");
})();
