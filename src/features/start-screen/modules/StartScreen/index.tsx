import { useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import * as T from "./index.style";
import { Button, Text } from "@/components/ui";

const item = { hidden: { opacity: 0, y: -24 }, show: { opacity: 1, y: 0 } };

const StartScreenModule = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  return (
    <T.Container>
      <T.BgVideo
        autoPlay
        muted
        loop
        playsInline
        poster="/static/poke-group.avif"
        aria-hidden="true">
        <source src="/static/poke-group.webm" type="video/webm" />
      </T.BgVideo>

      <T.Centering
        initial={reduced ? false : "hidden"}
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.15 } } }}>
        <motion.div variants={item}>
          <Text as="h1" variant="outlined" size="xl">
            POKEGAMES
          </Text>
        </motion.div>
        <motion.div variants={item}>
          <T.Blink>
            <Button
              onClick={() => navigate({ to: "/pokemons" })}
              variant="light">
              Press Start
            </Button>
          </T.Blink>
        </motion.div>
        <motion.div variants={item}>
          <Text variant="outlined" size="base">
            Source API{" "}
            <T.A
              href="https://pokeapi.co"
              target="_blank"
              rel="noopener noreferrer">
              PokeAPI
            </T.A>
          </Text>
        </motion.div>
      </T.Centering>

      <T.Footer
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}>
        <Text variant="outlined">
          &copy;{new Date().getFullYear()} radespratama
        </Text>
        <Text variant="outlined">
          | Want to contribute?{" "}
          <T.A
            href="https://github.com/radespratama/pokegames"
            target="_blank"
            rel="noopener noreferrer">
            GitHub
          </T.A>
        </Text>
      </T.Footer>
    </T.Container>
  );
};

export default StartScreenModule;
