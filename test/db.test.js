
const {
    getAssets,
    getMeters,
    getMap,
    createMap,
    updateMap,
    deleteMap,
    createMapMeterMarker
} = require('../src/db')

describe('LowDB Map CRUD', () => {

    jest.setTimeout(50000)

    it('Asset get all', async () => {
        expect.assertions(2);
        const assets = await getAssets();

        await expect(assets).toBeTruthy();
        await expect(assets).toHaveLength(2);
    });

    it('Meter get all', async () => {
        expect.assertions(2);
        const meters = await getMeters();

        await expect(meters).toBeTruthy();
        await expect(meters).toHaveLength(13);
    });

    it('Create/Fetch/Update/Add-Update Marker/Delete a map', async () => {
        expect.assertions(30);

        // <editor-fold desc="CREATE">
        const expectedMap = {
            name: 'Jest Demo Map',
            assetId: '1',
            path: '/uploads/test',
            width: 450,
            height: 450,
            maxZoom: 5
        };

        const map = await createMap(expectedMap);

        await expect(map.id).toBeTruthy();
        await expect(map.name).toStrictEqual(expectedMap.name);
        await expect(map.assetId).toStrictEqual(expectedMap.assetId);
        await expect(map.path).toStrictEqual(expectedMap.path);
        await expect(map.width).toStrictEqual(expectedMap.width);
        await expect(map.height).toStrictEqual(expectedMap.height);
        await expect(map.maxZoom).toStrictEqual(expectedMap.maxZoom);
        // </editor-fold>

        // <editor-fold desc="GET">
        const fetchedMap = await getMap(map.id);

        await expect(fetchedMap).toBeTruthy();
        await expect(fetchedMap.id).toStrictEqual(map.id);
        await expect(fetchedMap.name).toStrictEqual(map.name);
        await expect(fetchedMap.assetId).toStrictEqual(map.assetId);
        await expect(fetchedMap.path).toStrictEqual(map.path);
        await expect(fetchedMap.width).toStrictEqual(map.width);
        await expect(fetchedMap.height).toStrictEqual(map.height);
        await expect(fetchedMap.maxZoom).toStrictEqual(map.maxZoom);
        // </editor-fold>

        // <editor-fold desc="UPDATE">
        const expectedUpdateMap = {
            name: 'Jest Demo Map 2',
            path: '/uploads/jest',
            width: 520,
            height: 530,
            maxZoom: 7
        };

        const updatedMap = await updateMap(map.id, {
            name: expectedUpdateMap.name,
            path: expectedUpdateMap.path,
            width: expectedUpdateMap.width,
            height: expectedUpdateMap.height,
            maxZoom: expectedUpdateMap.maxZoom
        });

        await expect(updatedMap).toBeTruthy();
        await expect(updatedMap.id).toStrictEqual(map.id);
        await expect(updatedMap.name).toStrictEqual(expectedUpdateMap.name);
        await expect(updatedMap.path).toStrictEqual(expectedUpdateMap.path);
        await expect(updatedMap.width).toStrictEqual(expectedUpdateMap.width);
        await expect(updatedMap.height).toStrictEqual(expectedUpdateMap.height);
        await expect(updatedMap.maxZoom).toStrictEqual(expectedUpdateMap.maxZoom);
        await expect(updatedMap.updatedAt).toBeTruthy();
        // </editor-fold>

        // <editor-fold desc="CREATE MAP METER MARKER">
        const expectedMeterMarker = {
            meterId: '1',
            name: 'Meter 1',
            x: 245,
            y: 129,
        };

        const meterMarker = await createMapMeterMarker(map.id, expectedMeterMarker)
        await expect(meterMarker).toStrictEqual(expectedMeterMarker);
        // </editor-fold>

        // <editor-fold desc="FETCH AFTER METER MARKER WAS ADDED">
        const fetchedMapAfterMeterMarkerAdd = await getMap(map.id);

        await expect(fetchedMapAfterMeterMarkerAdd.meterMarkers[0]).toStrictEqual(meterMarker);
        // </editor-fold>

        // <editor-fold desc="EDIT MAP METER MARKER">
        const updatedMeterMarker = await updateMapMeterMarker(map.id, meterMarker.meterId, {
            x: 102,
            y: 54
        })
        await expect(updatedMeterMarker).toBeTruthy();
        await expect(updatedMeterMarker.name).toStrictEqual(meterMarker.name);
        await expect(updatedMeterMarker.x).toStrictEqual(102);
        await expect(updatedMeterMarker.y).toStrictEqual(54);
        // </editor-fold>

        // <editor-fold desc="DELETE">
        await deleteMap(map.id);

        await expect(await getMap(map.id)).toBeUndefined();
        // </editor-fold>
    });
})