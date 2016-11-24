/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {App} from "./app";

describe('App', () => {
    it('should init', () => {
        let app = new App();

        expect(app).toBeDefined();
        expect(Object.keys(app.channels).length).toEqual(0);
        expect(Object.keys(app.peers).length).toEqual(0);
    });
});
