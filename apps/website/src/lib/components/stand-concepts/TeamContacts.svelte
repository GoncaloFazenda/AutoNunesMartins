<script lang="ts">
  import { ArrowUpRight, Phone, Mail } from 'lucide-svelte';
  import type { TeamMember } from './aboutContent';
  let { people, introduction }: { people: TeamMember[]; introduction: string } = $props();
</script>

<section id="a-nossa-equipa" class="team" aria-labelledby="team-title">
  <div class="team-heading">
    <div>
      <p class="eyebrow"><span aria-hidden="true"></span> A nossa equipa</p>
      <h2 id="team-title">É connosco<br /><span>que vai falar.</span></h2>
    </div>
    <p class="introduction">{introduction}</p>
  </div>
  {#if people.some((person) => person.exampleContact)}
    <p class="contact-note">Contactos de exemplo · não recebem mensagens.</p>
  {/if}
  <div class="people">
    {#each people as person (person.name)}
      <article class="person" aria-label={person.name}>
        <div class="identity">
          <p class="role">{person.role}</p>
          <h3><span class="first-name">{person.name.split(' ')[0]}</span>{' '}<span class="remaining-name">{person.name.split(' ').slice(1).join(' ')}</span></h3>
        </div>
        <div class="conversation">
          <p class="description">{person.text}</p>
          {#if person.phone || person.email}
            <div class="contacts" aria-label={'Contactos de ' + person.name}>
              {#if person.phone}
                <a
                  href={'tel:' + person.phone.international}
                  aria-label={'Ligar a ' + person.name + ': ' + person.phone.display}
                >
                  <Phone size={15} aria-hidden="true" />{person.phone.display}
                </a>
              {/if}
              {#if person.email}
                {#if person.exampleContact}
                  <span class="example-contact"
                    ><Mail size={15} aria-hidden="true" />{person.email}</span
                  >
                {:else}
                  <a
                    href={'mailto:' + person.email}
                    aria-label={'Enviar email a ' + person.name + ': ' + person.email}
                  >
                    <Mail size={15} aria-hidden="true" />{person.email}
                  </a>
                {/if}
              {/if}
            </div>
          {/if}
        </div>
      </article>
    {/each}
  </div>

  <div class="invitation">
    <p>Uma equipa por perto.<br /><span>Uma conversa de cada vez.</span></p>
    <a href="#contactos">Venha conhecer-nos <ArrowUpRight size={18} aria-hidden="true" /></a>
  </div>
</section>

<style>
  .first-name { color: var(--red); }
  .remaining-name { color: var(--text); }
  .team {
    width: var(--orbit-frame);
    max-width: var(--orbit-frame-max);
    margin-inline: auto;
    padding-top: var(--orbit-space-section);
    scroll-margin-top: 100px;
    color: var(--text);
  }
  .team-heading {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: end;
    padding-bottom: 48px;
  }
  .eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    letter-spacing: 0.09em;
    margin: 0 0 24px;
  }
  .eyebrow > span {
    width: 7px;
    height: 7px;
    background: var(--red);
    border-radius: 50%;
  }
  h2 {
    font-size: clamp(36px, 4.5vw, 64px);
    font-weight: 500;
    letter-spacing: -0.05em;
    line-height: 1.06;
    margin: 0;
  }
  h2 span {
    color: var(--muted);
  }
  .introduction {
    max-width: 37ch;
    margin: 0 0 4px;
    color: var(--muted);
    font-size: 17px;
    line-height: 1.75;
  }
  .people {
    border-top: 1px solid var(--line);
  }
  .person {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
    padding: 38px 0;
    border-bottom: 1px solid var(--line);
  }
  .identity,
  .conversation {
    min-width: 0;
  }
  .role {
    margin: 0 0 12px;
    font-size: 12px;
    color: var(--muted);
  }
  h3 {
    margin: 0;
    font-size: clamp(28px, 3.4vw, 46px);
    line-height: 1.15;
    letter-spacing: -0.04em;
    font-weight: 500;
  }
  .description {
    margin: 0;
    max-width: 40ch;
    font-size: 16px;
    line-height: 1.75;
    color: var(--muted);
  }
  .contacts {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 24px;
    margin-top: 16px;
  }
  a {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    color: var(--text);
    text-decoration: none;
    font-size: 14px;
    overflow-wrap: anywhere;
  }
  .example-contact {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    font-size: 14px;
    overflow-wrap: anywhere;
  }
  .contact-note {
    margin: 0 0 16px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--muted);
  }
  a :global(svg) {
    flex-shrink: 0;
  }
  a:hover {
    color: var(--red);
  }
  a:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 5px;
    border-radius: 2px;
  }
  .invitation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding-top: 32px;
  }
  .invitation p {
    margin: 0;
    font-size: 18px;
    line-height: 1.55;
    letter-spacing: -0.02em;
  }
  .invitation p span {
    color: var(--muted);
  }
  .invitation a {
    border-bottom: 1px solid var(--red);
  }
  @media (prefers-reduced-motion: no-preference) {
    a {
      transition: color 180ms ease;
    }
  }
  @media (max-width: 700px) {
    .team-heading {
      grid-template-columns: 1fr;
      gap: 24px;
      padding-bottom: 32px;
    }
    .introduction {
      font-size: 16px;
      max-width: 42ch;
    }
    .person {
      grid-template-columns: 1fr;
      gap: 16px;
      padding-block: 28px;
    }
    .role {
      margin-bottom: 9px;
    }
    .description {
      font-size: 15px;
    }
    .invitation {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      padding-top: 28px;
    }
  }
</style>
