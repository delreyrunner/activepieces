import { AppSystemProp, logger, SharedSystemProp, system } from '@activepieces/server-shared'
import { ProjectId, TelemetryEvent, User, UserId } from '@activepieces/shared'
import { Analytics } from '@segment/analytics-node'
import { flagService } from '../flags/flag.service'
import { platformService } from '../platform/platform.service'
import { projectService } from '../project/project-service'

const telemetryEnabled = system.getBoolean(AppSystemProp.TELEMETRY_ENABLED)

const analytics = new Analytics({ writeKey: '42TtMD2Fh9PEIcDO2CagCGFmtoPwOmqK' })

export const telemetry = {
    async identify(user: User, projectId: ProjectId): Promise<void> {
        if (!telemetryEnabled) {
            return
        }
        const identify = {
            userId: user.id,
            traits: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                projectId,
                firstSeenAt: user.created,
                ...(await getMetadata()),
            },
        }
        analytics.identify(identify)
    },
    async trackPlatform(platformId: ProjectId, event: TelemetryEvent): Promise<void> {
        if (!telemetryEnabled) {
            return
        }
        const platform = await platformService.getOneOrThrow(platformId)
        await this.trackUser(platform.ownerId, event)
    },
    async trackProject(
        projectId: ProjectId,
        event: TelemetryEvent,
    ): Promise<void> {
        if (!telemetryEnabled) {
            return
        }
        const project = await projectService.getOne(projectId)
        this.trackUser(project!.ownerId, event).catch((e) =>
            logger.error(e, '[Telemetry#trackProject] this.trackUser'),
        )
    },
    isEnabled: () => telemetryEnabled,
    async trackUser(userId: UserId, event: TelemetryEvent): Promise<void> {
        if (!telemetryEnabled) {
            return
        }
        const payloadEvent = {
            userId,
            event: event.name,
            properties: {
                ...event.payload,
                ...(await getMetadata()),
                datetime: new Date().toISOString(),
            },
        }
        logger.info(payloadEvent, '[Telemetry#trackUser] sending event')
        analytics.track(payloadEvent)
    },
}

async function getMetadata() {
    const currentVersion = await flagService.getCurrentRelease()
    const edition = system.getEdition()
    return {
        activepiecesVersion: currentVersion,
        activepiecesEnvironment: system.get(SharedSystemProp.ENVIRONMENT),
        activepiecesEdition: edition,
    }
}
