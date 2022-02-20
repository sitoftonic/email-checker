import { SMTPChannel } from 'smtp-channel';
import dns from 'dns';

export class EmailChecker {
    /**
     * @param {string} from Email of the address to be used for "FROM". Message is not sent, so it will be transparent for the end-user, but it is required
     * @param {string} to Email of the address to be checked
     */
    constructor(from, to) {
        this.from = from
        // TODO: Check email validity
        this.to = to
        this.domain = this.to.split('@')[1]
    }

    async getMxRecord() {
        return await new Promise((resolve, reject) => {
            dns.resolveMx(this.domain, (err, addresses) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    addresses.sort(this.compareMxPriorities)
                    console.log(addresses[0].exchange)
                    resolve(addresses[0].exchange)
                }
            });
        })
    }

    compareMxPriorities(a, b) {
        if (Number(a.priority) < Number(b.priority)) {
            return 1;
        } else {
            return -1;
        }
    }

    async tryConnection() {
        const mxServer = await this.getMxRecord();

        let handler = console.log;

        // To check if more ports combination is required
        let s = new SMTPChannel({
            host: mxServer,
            port: 25
        });

        await s.connect({ timeout: 3000 });
        await s.write(`EHLO ${this.domain}\r\n`);
        await s.write(`HELO ${this.domain}\r\n`);
        await s.write(`MAIL FROM: <${this.from}>\r\n`);
        await s.write(`RCPT TO: <${this.to}>\r\n`, { handler });
        await s.write('QUIT\r\n');
    }
}