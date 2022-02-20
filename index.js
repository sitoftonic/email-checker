import { EmailChecker } from "./checker.js";


async function main() {
    const checker = new EmailChecker('whatever@hotmail.com', 'whatever@gmail.com');
    await checker.tryConnection(); 
}

main();
