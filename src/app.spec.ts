/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {App} from "./app";
import {Config} from "./config";

describe('App', () => {
    it('should init', () => {
        let conf = new Config();
        let app = new App(conf);

        expect(app).toBeDefined();
        expect(Object.keys(app.channels).length).toEqual(0);
        expect(Object.keys(app.peers).length).toEqual(0);
    });
});
