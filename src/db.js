const { v4: uuidv4 } = require('uuid');
const FileSync = require('lowdb/adapters/FileSync')
const _ = require('lodash');

const adapter = new FileSync('db.json')
const db = require('lowdb')(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({
    assets: [],
    meters: [],
    maps: [],
}).write()

getAll = () => {
    return db.value()
}

// <editor-fold desc="ASSETS">

/**
 * Get all assets
 * @returns AssetModel[]
 */
getAssets = () => {
    return db.get('assets')
        .value()
}

//</editor-fold>

// <editor-fold desc="DEVICES">

/**
 * Get all devices
 * @returns DeviceModel[]
 */
getMeters = () => {
    return db.get('meters')
        .value()
}

//</editor-fold>

// <editor-fold desc="MAPS">

/**
 * Get all maps
 * @returns MapModel[]
 */
getMaps = () => {
    return db.get('maps')
        .value()
}

/**
 * Get a map by id
 * @param id
 * @returns MapModel
 */
getMap = async (id) => {
    return await db.get('maps')
        .find({ id })
        .value();
}

/**
 * Create a map if id is not exists
 * @param map
 * @returns MapModel
 */
createMap = async (map) => {
    if (db.get('maps')
        .find({ id: map.id })
        .value()) {
        await db.get('maps')
            .find({ id: map.id })
            .assign({
                ...map,
                updatedAt: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
            })
            .write()

        return getMap(map.id);
    } else {
        const newMap = {
            ...map,
            id: uuidv4(),
            createdAt: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
            updatedAt: null
        }

        await db.get('maps')
            .push(newMap)
            .write()

        return newMap;
    }
}

/**
 * Update a map
 * @param id
 * @param map
 * @returns MapModel
 */
updateMap = async (id, map) => {
    await db.get('maps')
        .find({ id })
        .assign({
            name: map.name,
            path: map.path,
            width: map.width,
            height: map.height,
            maxZoom: map.maxZoom,
            updatedAt: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
        })
        .write()

    return getMap(id);
}

/**
 * Delete a map
 * @param id
 */
deleteMap = async (id) => {
    db.get('maps')
        .remove({ id })
        .write()
}

//</editor-fold>

// <editor-fold desc="MAPS METER MARKER">

/**
 * Create a meter marker
 * @param mapId
 * @param meterMarker
 * @returns meterMarker
 */
createMapMeterMarker = async (mapId, meterMarker) => {
    const map = await getMap(mapId);
    const meterMarkers = [...(map.meterMarkers || [])];
    let editedMarker;

    meterMarkers.push(meterMarker);
    editedMarker = meterMarker;

    await db.get('maps')
        .find({ id: mapId })
        .assign({
            meterMarkers: meterMarkers,
            updatedAt: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
        })
        .write()

    return editedMarker;
}

/**
 * Update a meter marker
 * @param mapId
 * @param meterId
 * @param meterMarker
 * @returns meterMarker
 */
updateMapMeterMarker = async (mapId, meterId, {x, y}) => {
    const map = await getMap(mapId);
    const meterMarkers = [...(map.meterMarkers || [])];
    let editedMarker;
    const index = meterMarkers.findIndex(mm => mm.meterId.toString() === meterId.toString());
    if(index !== -1) {
        meterMarkers[index] = {
            ...meterMarkers[index],
            x,
            y
        };
        editedMarker = meterMarkers[index];

        await db.get('maps')
            .find({ id: mapId })
            .assign({
                meterMarkers: meterMarkers,
                updatedAt: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
            })
            .write()
    }

    return editedMarker;
}

//</editor-fold>

module.exports = {
    getAll,
    getAssets,
    getMeters,
    getMaps,
    getMap,
    createMap,
    updateMap,
    deleteMap,
    createMapMeterMarker,
    updateMapMeterMarker
}