import fsExtra from "fs-extra"
import path from "path"
import { DATABASE_PATH } from "../config/constants.js"

const GROUPS_PATH = path.resolve(DATABASE_PATH, "..", "groups")

const DEFAULT_SETTINGS = {
  enabled: false,
  language: "en",
  prefix: "/",
  welcome: true,
  antiSpam: false,
  economy: true,
  combat: true,
  utility: true
}

export async function ensureGroupsDir() {
  await fsExtra.ensureDir(GROUPS_PATH)
}

export function getGroupFilePath(groupId) {
  const safeId = groupId.replace(/[@.]/g, "_")
  return path.join(GROUPS_PATH, `${safeId}.json`)
}

export async function getGroup(groupId) {
  await ensureGroupsDir()
  const filePath = getGroupFilePath(groupId)
  if (await fsExtra.pathExists(filePath)) {
    const data = await fsExtra.readJson(filePath)
    return { ...DEFAULT_SETTINGS, ...data, groupId }
  }
  return { ...DEFAULT_SETTINGS, groupId, enabled: false, enabledBy: null, enabledAt: null }
}

export async function saveGroup(groupId, settings) {
  await ensureGroupsDir()
  const filePath = getGroupFilePath(groupId)
  const data = { groupId, ...settings }
  await fsExtra.writeJson(filePath, data, { spaces: 2 })
  return data
}

export async function enableGroup(groupId, enabledBy) {
  const group = await getGroup(groupId)
  group.enabled = true
  group.enabledBy = enabledBy
  group.enabledAt = Date.now()
  await saveGroup(groupId, group)
  return group
}

export async function disableGroup(groupId) {
  const group = await getGroup(groupId)
  group.enabled = false
  group.enabledBy = null
  group.enabledAt = null
  await saveGroup(groupId, group)
  return group
}

export async function isGroupEnabled(groupId) {
  const group = await getGroup(groupId)
  return group.enabled
}

export async function setGroupSetting(groupId, key, value) {
  const group = await getGroup(groupId)
  group[key] = value
  await saveGroup(groupId, group)
  return group
}

export async function enableGroupModule(groupId, moduleName) {
  const group = await getGroup(groupId)
  group[moduleName] = true
  await saveGroup(groupId, group)
  return group
}

export async function disableGroupModule(groupId, moduleName) {
  const group = await getGroup(groupId)
  group[moduleName] = false
  await saveGroup(groupId, group)
  return group
}

export async function loadAllGroups() {
  await ensureGroupsDir()
  try {
    const files = await fsExtra.readdir(GROUPS_PATH)
    const groups = []
    for (const file of files) {
      if (!file.endsWith(".json")) continue
      const filePath = path.join(GROUPS_PATH, file)
      const data = await fsExtra.readJson(filePath)
      groups.push(data)
    }
    return groups
  } catch {
    return []
  }
}
