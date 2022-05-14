import { InfoStack } from './Info-stack';
export declare class InfoStackMessage {
    domElement: HTMLElement;
    private customConsole;
    private elapsedTime;
    private removalTriggered;
    constructor(console: InfoStack, domElement: HTMLElement);
    update(timeStep: number): void;
    private triggerRemoval;
}
